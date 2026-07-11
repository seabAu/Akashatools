// @ts-check

import akasha, * as root from "akashatools";

const chunksFromFlatCompletion = akasha.chunk([1, 2, 3], 2);
const chunksFromCategoryCompletion = akasha.array.chunk([1, 2, 3], 2);
const validationFromCategoryCompletion = akasha.validation.isEmail("person@example.com");
const validationFromStarImport = root.validation.isEmail("person@example.com");

/** @type {number[][]} */
const checkedChunks = chunksFromFlatCompletion;
/** @type {boolean} */
const checkedValidation = validationFromCategoryCompletion;

void chunksFromCategoryCompletion;
void validationFromStarImport;
void checkedChunks;
void checkedValidation;
