const fs = require('fs');
const SocialLinkCategoryModel = require('../model/socialLinkCategoryModel');
const { uploadSocialLinkCategoryIcon, getImageBase64WithExt } = require('../utils/fileHelper');

const linkedInimg = fs.readFileSync('public/linkedInIcon.png');
const facebookimg = fs.readFileSync('public/FacebookIcon.png');
const Instagramimg = fs.readFileSync('public/InstagramIcon.png');

const checkLinkCategoryAvailableOrNot = async () => {
  const linkCategoryData = await SocialLinkCategoryModel.find({});

  if (linkCategoryData.length > 0) return;

  const url1 = linkedInimg;
  const url2 = facebookimg;
  const url3 = Instagramimg;
  const base641 = await getImageBase64WithExt(url1);
  const base642 = await getImageBase64WithExt(url2);
  const base643 = await getImageBase64WithExt(url3);

  const iconImgPath1 = await uploadSocialLinkCategoryIcon(base641);
  const iconImgPath2 = await uploadSocialLinkCategoryIcon(base642);
  const iconImgPath3 = await uploadSocialLinkCategoryIcon(base643);

  const linkCategories = [
    { name: 'LinkedIn', icon: iconImgPath1.path, link: 'https://www.linkedin.com' },
    { name: 'Facebook', icon: iconImgPath2.path, link: 'https://www.facebook.com' },
    { name: 'Instagram', icon: iconImgPath3.path, link: 'https://www.instagram.com' },
  ];

  await SocialLinkCategoryModel.insertMany(linkCategories);
};

module.exports = checkLinkCategoryAvailableOrNot;
