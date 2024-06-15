const TOKEN = '7305678243:AAEGUtqt56DQH8ZiegNmHrbUAOMIaZyxaQA';
const CHANNEL_USERNAME = '@No1xKURD';
const BOT_URL = `https://api.telegram.org/bot${TOKEN}`;
const WEB_APP_URL = 'https://github.com/Par123456/Bottel/main/worker.js'; // پس از انتشار وب اپلیکیشن، این URL را جایگزین کنید.
const ADMINS = ['6508600903'];

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.message) {
    handleMessage(data.message);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
}

function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;
  
  if (text) {
    if (text === '/start') {
      sendMessage(chatId, 'به ربات آپلود خوش آمدید! لطفاً ابتدا به کانال ما بپیوندید: ' + CHANNEL_USERNAME);
    } else if (text.startsWith('/upload')) {
      handleUploadCommand(chatId);
    } else if (text.startsWith('/addadmin')) {
      const newAdminId = text.split(' ')[1];
      handleAddAdmin(chatId, newAdminId);
    } else if (text.startsWith('/removeadmin')) {
      const adminIdToRemove = text.split(' ')[1];
      handleRemoveAdmin(chatId, adminIdToRemove);
    }
  }
  
  if (message.document) {
    handleDocument(chatId, message.document);
  }
}

function handleUploadCommand(chatId) {
  if (!ADMINS.includes(chatId.toString())) {
    isUserInChannel(chatId).then(isMember => {
      if (!isMember) {
        sendMessage(chatId, 'شما باید ابتدا به کانال ما بپیوندید: ' + CHANNEL_USERNAME);
      } else {
        sendMessage(chatId, 'لطفاً فایل مورد نظر خود را ارسال کنید.');
      }
    });
  } else {
    sendMessage(chatId, 'لطفاً فایل مورد نظر خود را ارسال کنید.');
  }
}

function handleDocument(chatId, document) {
  if (!ADMINS.includes(chatId.toString())) {
    isUserInChannel(chatId).then(isMember => {
      if (!isMember) {
        sendMessage(chatId, 'شما باید ابتدا به کانال ما بپیوندید: ' + CHANNEL_USERNAME);
        return;
      }
    });
  }
  
  const fileId = document.file_id;
  sendMessage(chatId, 'فایل دریافت شد. در حال آپلود...');
  
  const fileUrl = `${BOT_URL}/getFile?file_id=${fileId}`;
  const response = UrlFetchApp.fetch(fileUrl);
  const fileData = JSON.parse(response.getContentText());
  const fileLink = `${BOT_URL}/file/bot${TOKEN}/${fileData.result.file_path}`;
  
  sendMessage(chatId, `فایل با موفقیت آپلود شد: ${fileLink}`);
}

function handleAddAdmin(chatId, newAdminId) {
  if (!ADMINS.includes(chatId.toString())) {
    sendMessage(chatId, 'شما اجازه افزودن ادمین جدید را ندارید.');
    return;
  }
  
  if (!ADMINS.includes(newAdminId)) {
    ADMINS.push(newAdminId);
    sendMessage(chatId, `کاربر ${newAdminId} به عنوان ادمین جدید اضافه شد.`);
  } else {
    sendMessage(chatId, `کاربر ${newAdminId} هم اکنون ادمین است.`);
  }
}

function handleRemoveAdmin(chatId, adminIdToRemove) {
  if (!ADMINS.includes(chatId.toString())) {
    sendMessage(chatId, 'شما اجازه حذف ادمین‌ها را ندارید.');
    return;
  }
  
  if (ADMINS.includes(adminIdToRemove)) {
    const index = ADMINS.indexOf(adminIdToRemove);
    if (index > -1) {
      ADMINS.splice(index, 1);
      sendMessage(chatId, `کاربر ${adminIdToRemove} از لیست ادمین‌ها حذف شد.`);
    }
  } else {
    sendMessage(chatId, `کاربر ${adminIdToRemove} ادمین نیست.`);
  }
}

function isUserInChannel(userId) {
  const url = `${BOT_URL}/getChatMember?chat_id=${CHANNEL_USERNAME}&user_id=${userId}`;
  return UrlFetchApp.fetch(url).then(response => {
    const data = JSON.parse(response.getContentText());
    return data.result && (data.result.status === 'member' || data.result.status === 'administrator' || data.result.status === 'creator');
  });
}

function sendMessage(chatId, text) {
  const url = `${BOT_URL}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;
  UrlFetchApp.fetch(url);
}

function setWebhook() {
  const url = `${BOT_URL}/setWebhook?url=${WEB_APP_URL}`;
  UrlFetchApp.fetch(url);
}
