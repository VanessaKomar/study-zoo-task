const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const config = {
  nextcloudUrl: 'https://cloud.tugraz.at',
  username: process.env.NEXTCLOUD_USERNAME,
  appPassword: process.env.NEXTCLOUD_APP_PASSWORD,
  remotePath: '/Shared/2025-10_AI1_Bonus_Task_Study/Advanced Zoo Task/Automatic Upload Test'
};

const folders = [
  { local: './config', remote: 'config' },
  { local: './chat_Log', remote: 'chat_Log' },
  { local: './chat_History', remote: 'chat_History' }
];

async function createDirectory(remotePath) {
  const webdavUrl = `${config.nextcloudUrl}/remote.php/dav/files/${config.username}${remotePath}`;
  try {
    await axios.request({
      method: 'MKCOL',
      url: webdavUrl,
      auth: { username: config.username, password: config.appPassword }
    });
  } catch (err) {
    // dir might exist already, ignore error
  }
}

async function uploadFile(localPath, remotePath) {
  const fileStream = fs.createReadStream(localPath);
  const webdavUrl = `${config.nextcloudUrl}/remote.php/dav/files/${config.username}${remotePath}`;

  await axios.put(webdavUrl, fileStream, {
    auth: { username: config.username, password: config.appPassword },
    headers: { 'Content-Type': 'application/octet-stream' }
  });
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

async function syncFolders() {
  for (const folder of folders) {
    if (!fs.existsSync(folder.local)) continue;

    const files = getAllFiles(folder.local);
    for (const file of files) {
      const relativePath = path.relative(folder.local, file);
      const remotePath = `${config.remotePath}/${folder.remote}/${relativePath}`;
      const remoteDir = path.dirname(remotePath);

      try {
        // create all dirs
        const pathParts = remoteDir.split('/').filter(Boolean);
        let currentPath = '';
        for (const part of pathParts) {
          currentPath += '/' + part;
          await createDirectory(currentPath);
        }

        await uploadFile(file, remotePath);
      } catch (err) {
        console.error(`Error uploading ${file} to ${remotePath}:`, err.message);
      }
    }
  }
}

cron.schedule('* * * * *', syncFolders);
syncFolders();