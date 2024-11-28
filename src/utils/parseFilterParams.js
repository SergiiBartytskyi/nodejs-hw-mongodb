import { typeList } from '../constants/index.js';

const parseContactType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;
  const isType = (type) => typeList.includes(type);

  if (isType(type)) return type;
};

const parseIsFavourite = (boolean) => {
  const isString = typeof boolean === 'string';
  if (!isString) return;

  const isFavourite = boolean.toLowerCase();

  return isFavourite;
};

export const parseFilterParams = (query) => {
  const { contactType, isFavourite } = query;

  const parsedType = parseContactType(contactType);
  const parsedIsFavourite = parseIsFavourite(isFavourite);

  return {
    type: parsedType,
    isFavourite: parsedIsFavourite,
  };
};
