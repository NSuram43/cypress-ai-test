import { When } from '@badeball/cypress-cucumber-preprocessor';
import { uploadCodeDecodeExcel, generateRandomValue, UploadType } from '../../support/utils/bulkUpload';

When(
  'User uploads Code Decode File {string} for {string} operation',
  (fileName: string, operationType: string) => {
    let code = generateRandomValue();
    const decode = generateRandomValue();

    Cypress.env('uploadedCode', code);
    Cypress.env('uploadedDecode', decode);

    let funcType: UploadType;
    switch (operationType.toLowerCase()) {
      case 'add':
        funcType = UploadType.Add;
        break;
      case 'update':
        funcType = UploadType.Update;
        // If you want a deterministic code for update scenarios, you can set it here
        // Otherwise, keep the randomly generated one
        code = code; // no-op to avoid shadowing as in the old code
        break;
      case 'delete':
        funcType = UploadType.Delete;
        break;
      case 'new category':
        funcType = UploadType.NewCategory;
        break;
      default:
        throw new Error(`Unknown operation type: ${operationType}`);
    }

    uploadCodeDecodeExcel(fileName, code, decode, funcType);
  },
);