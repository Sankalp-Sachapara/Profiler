const IndustryTypeModel = require('../model/industryTypeModel');
const { uploadIndustryTypeIcon, getImageBase64WithExt } = require('../utils/fileHelper');

const checkIndustryTypeAvailableOrNot = async () => {
  const interestData = await IndustryTypeModel.find({});

  if (interestData.length > 0) return;

  const url1 =
    'https://img.freepik.com/premium-vector/soccer-ball-icon-logo-template-football-logo-symbol_7649-4092.jpg?w=2000';
  const url2 =
    'https://www.designfreelogoonline.com/wp-content/uploads/2014/10/00136-Bubbles-art-logo-design-free-logos-online-01.png';
  const url3 =
    'https://images-platform.99static.com/ZGp7Mbi6KJwUIgO3qyFiCxfyf3I=/0x15:981x996/500x500/top/smart/99designs-contests-attachments/80/80643/attachment_80643970';
  const base641 = await getImageBase64WithExt(url1);
  const base642 = await getImageBase64WithExt(url2);
  const base643 = await getImageBase64WithExt(url3);

  const iconImgPath1 = await uploadIndustryTypeIcon(base641);
  const iconImgPath2 = await uploadIndustryTypeIcon(base642);
  const iconImgPath3 = await uploadIndustryTypeIcon(base643);

  const industryType = [
    { name: 'Commerce', icon: iconImgPath1.path },
    { name: 'Construction', icon: iconImgPath2.path },
    { name: 'Automation', icon: iconImgPath3.path },
  ];

  await IndustryTypeModel.insertMany(industryType);
};

module.exports = checkIndustryTypeAvailableOrNot;
