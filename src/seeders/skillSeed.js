const SkillCategoryModel = require('../model/skillCategoryModel.');
const SkillModel = require('../model/skillModel');
const { uploadSkillIcon, getImageBase64WithExt } = require('../utils/fileHelper');

const checkSkillAvailableOrNot = async () => {
  let skillCategoryData = await SkillCategoryModel.find({});

  if (skillCategoryData.length > 0) return;

  const skillCategory = [{ name: 'Tech' }, { name: 'Doctor' }, { name: 'Arts' }];

  skillCategoryData = await SkillCategoryModel.insertMany(skillCategory);

  const skillData = await SkillModel.find({});

  if (skillData.length > 0) return;

  const url1 =
    'https://w7.pngwing.com/pngs/48/819/png-transparent-logo-product-design-brand-editing-logo-text-label-resume.png';
  const url2 = 'https://cdn5.vectorstock.com/i/thumb-large/91/24/travel-logo-vector-29969124.jpg';
  const url3 =
    'https://image.shutterstock.com/image-vector/vintage-video-camera-logo-design-260nw-2086440334.jpg';
  const base641 = await getImageBase64WithExt(url1);
  const base642 = await getImageBase64WithExt(url2);
  const base643 = await getImageBase64WithExt(url3);

  const iconImgPath1 = await uploadSkillIcon(base641);
  const iconImgPath2 = await uploadSkillIcon(base642);
  const iconImgPath3 = await uploadSkillIcon(base643);

  const techCategoryId = skillCategoryData.filter((e) => e.name === 'Tech');
  const doctorCategoryId = skillCategoryData.filter((e) => e.name === 'Doctor');
  const artsCategoryId = skillCategoryData.filter((e) => e.name === 'Arts');

  const skills = [
    { name: 'Software Developer', categoryId: techCategoryId[0]._id, icon: iconImgPath1.path },
    { name: 'Physician', categoryId: doctorCategoryId[0]._id, icon: iconImgPath2.path },
    { name: 'Filming', categoryId: artsCategoryId[0]._id, icon: iconImgPath3.path },
  ];

  await SkillModel.insertMany(skills);
};

module.exports = checkSkillAvailableOrNot;
