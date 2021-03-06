'use strict';

const {writeFile, readFile} = require(`fs`).promises;
const os = require(`os`);
const path = require(`path`);

const chalk = require(`chalk`);
const {nanoid} = require(`nanoid`);

const {getRandomNumber, threeMonthsFromNowInMS, PATH_TO_MOCKS} = require(`../utils`);

const SENTENCES_IN_ANNOUNCE_MAX = 5;
const DEFAULT_OBJECTS_NUMBER = 1;
const MAX_COUNT = 1000;
const TEXTS_FOLDER = `../../../data`;

const generateOffer = async (value) => {
  const objectsInArrayNumber = Number.parseInt(value, 10) || DEFAULT_OBJECTS_NUMBER;
  if (objectsInArrayNumber > MAX_COUNT) {
    console.log(chalk.red(`Не больше 1000 объявлений`));
    process.exit(1);
  }
  const resultArray = [];
  for (let i = 0; i < objectsInArrayNumber; i++) {
    resultArray.push(await generateMockedObject());
  }
  try {
    await writeFile(PATH_TO_MOCKS, JSON.stringify(resultArray));
  } catch (e) {
    console.log(chalk.red(`Ошибка: ${e}`));
    process.exit(1);
  }
  console.log(chalk.green(`Готово!`));
  process.exit(0);
};

const generateMockedObject = async () => {
  const titleList = await getArrayFromFile(`titles.txt`);
  const textList = await getArrayFromFile(`sentences.txt`);
  return {
    id: nanoid(),
    title: titleList[getRandomNumber(0, titleList.length)],
    createdAt: new Date(getRandomNumber(threeMonthsFromNowInMS, +new Date())),
    annotation: await randomSliceArray(`sentences.txt`, SENTENCES_IN_ANNOUNCE_MAX),
    fullText: await randomSliceArray(`sentences.txt`, textList.length),
    category: await randomSliceArray(`categories.txt`),
    comments: await getComments(getRandomNumber(0, 10))
  };
};

const randomSliceArray = async (fileName, maxLength) => {
  const list = await getArrayFromFile(fileName);
  const start = getRandomNumber(0, list.length - 1);
  const end = getRandomNumber(start + 1, maxLength ? start + 1 + maxLength : list.length);
  return list.slice(start, end);
};

const getComments = async (commentsNumber = 1) => {
  const comments = [];
  for (let i = 0; i < commentsNumber; i++) {
    const text = await randomSliceArray(`comments.txt`);
    comments.push({
      id: nanoid(),
      text: text.join(` `)
    });
  }
  return comments;
};

const getArrayFromFile = async (fileName) => {
  const list = await readFile(path.resolve(__dirname, `${TEXTS_FOLDER}/`, fileName), `utf8`);
  return list.split(os.EOL).filter((i) => i);
};

module.exports = generateOffer;
