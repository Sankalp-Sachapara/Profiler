const LanguageModel = require('../model/languageModel');
const { uploadLanguageIcon, getImageBase64WithExt } = require('../utils/fileHelper');

const checkLanguageAvailableOrNot = async () => {
  const languageData = await LanguageModel.find({});

  if (languageData.length > 0) return;

  const url1 =
    'https://thumbs.dreamstime.com/b/english-colored-rainbow-word-text-suitable-logo-design-card-brochure-typography-127992761.jpg';
  const url2 =
    'https://t4.ftcdn.net/jpg/04/55/06/23/360_F_455062392_kbWOFmhpchPb1Hvu1AKEgQjfRkLLx7ES.jpg';
  const url3 =
    'https://cdn.shopify.com/s/files/1/1284/2827/products/Gujarati_1024x1024.png?v=1525520179';
  const base641 = await getImageBase64WithExt(url1);
  const base642 = await getImageBase64WithExt(url2);
  const base643 = await getImageBase64WithExt(url3);

  const iconImgPath1 = await uploadLanguageIcon(base641);
  const iconImgPath2 = await uploadLanguageIcon(base642);
  const iconImgPath3 = await uploadLanguageIcon(base643);

  const languages = [
    { name: 'English', icon: iconImgPath1.path },
    { name: 'Hindi', icon: iconImgPath2.path },
    { name: 'Gujarati', icon: iconImgPath3.path },
  ];

  await LanguageModel.insertMany(languages);
};

module.exports = checkLanguageAvailableOrNot;
