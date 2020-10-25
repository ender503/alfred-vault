const NodeVault = require('node-vault');

const SYSTEM_DIRECTORY = ['sys/', 'identity/'];

const transformKeys = (keys, path = '') => keys
  .map(key => key.replace(/\/$/, ""))
  .map(key => ({
    title: key,
    subtitle: key,
    arg: `${process.env.keyword} ${path}${key}`,
    variables: {
      action: 'rerun',
    }
  }));

const transformData = (data) => Object.entries(data)
  .map(([key, value]) => ({
    title: key,
    subtitle: value,
    arg: value,
    variables: {
      action: 'copy',
    }
  }));

const root = async (vault) => {
  return vault.read('/sys/internal/ui/mounts')
    .then(res =>
      transformKeys(
        Object.keys(res.data.secret)
          .filter(key => !SYSTEM_DIRECTORY.includes(key))
      )
    );
}


const list = async (vault, path) => {
  return vault.list(path)
    .then(res => transformKeys(res.data.keys, `${path}/`))
    .catch(e => {
      return null;
    });
}

const read = async (vault, path) => {
  return vault.read(path)
    .then(res => transformData(res.data))
    .catch(e => {
      return null;
    });
}


const fetch = async (path) => {
  const vault = NodeVault({
    apiVersion: "v1",
    endpoint: process.env.vault_address,
    token: process.env.vault_token,
    requestOptions: {
      strictSSL: false,
    }
  });

  if (path.trim() == '') {
    const items = root(vault);
    return items;
  }

  let items = await read(vault, path);

  if (items != null) {
    return items;
  }

  items = await list(vault, path);
  // console.log(path)
  if (items != null) {
    return items;
  }

  return [{
    title: 'Secret not found',
    subtitle: `No secret available for ${path}`,
  }];
}




module.exports = {
  fetch,
}