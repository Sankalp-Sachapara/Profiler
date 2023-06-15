const InterestCategoryModel = require('../model/interestCategoryModel');
const InterestModel = require('../model/interestModel');
const { uploadInterestIcon, getImageBase64WithExt } = require('../utils/fileHelper');

const checkInterestAvailableOrNot = async () => {
  let interestCategoryData = await InterestCategoryModel.find({});

  if (interestCategoryData.length > 0) return;

  const interestCategory = [{ name: 'Sports' }, { name: 'Arts' }, { name: 'Outdoor' }];

  interestCategoryData = await InterestCategoryModel.insertMany(interestCategory);

  const interestData = await InterestModel.find({});

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

  const iconImgPath1 = await uploadInterestIcon(base641);
  const iconImgPath2 = await uploadInterestIcon(base642);
  const iconImgPath3 = await uploadInterestIcon(base643);
  const sportsCategoryId = interestCategoryData.filter((e) => e.name === 'Sports');
  const artsCategoryId = interestCategoryData.filter((e) => e.name === 'Arts');
  const outdoorCategoryId = interestCategoryData.filter((e) => e.name === 'Outdoor');

  const interests = [
    {
      name: 'Football',
      categoryId: sportsCategoryId[0]._id,
      icon: iconImgPath1.path,
    },
    {
      name: 'Acting',
      categoryId: artsCategoryId[0]._id,
      icon: iconImgPath2.path,
    },
    {
      name: 'trekking',
      categoryId: outdoorCategoryId[0]._id,
      icon: iconImgPath3.path,
    },
  ];

  await InterestModel.insertMany(interests);
};

module.exports = checkInterestAvailableOrNot;
