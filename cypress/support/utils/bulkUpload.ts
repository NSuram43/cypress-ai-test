import ExcelJS from 'exceljs/dist/exceljs.min.js';

export enum UploadType {
  Add = 'Add',
  Update = 'Update',
  Delete = 'Delete',
  NewCategory = 'NewCategory',
}

export function generateRandomValue(length = 5): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvw123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getMimeTypeForXlsx(): string {
  return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
}

export function uploadCodeDecodeExcel(
  fileName: string,
  newCode: string,
  newDecode: string,
  func: UploadType,
): void {
  const xlsxMime = getMimeTypeForXlsx();

  cy.fixture(fileName, 'base64')
    .then((base64Content) => Cypress.Blob.base64StringToBlob(base64Content, xlsxMime))
    .then((blob) => blob.arrayBuffer())
    .then((arrayBuffer) => new Uint8Array(arrayBuffer))
    .then((uint8) => {
      const workbook = new ExcelJS.Workbook();
      return workbook.xlsx.load(uint8);
    })
    .then((workbook) => {
      const worksheet = workbook.worksheets[0];

      const headerRow = worksheet.getRow(1);
      const headerToColumnIndex = new Map<string, number>();
      headerRow.eachCell((cell, colNumber) => {
        const raw = cell.value;
        const header = typeof raw === 'string' ? raw.trim().toUpperCase() : String(raw ?? '').trim().toUpperCase();
        if (header) {
          headerToColumnIndex.set(header, colNumber);
        }
      });

      const ensureColumn = (name: string): number => {
        const idx = headerToColumnIndex.get(name);
        if (!idx) {
          throw new Error(`Column not found in header: ${name}`);
        }
        return idx;
      };

      const codeCol = ensureColumn('CODE');
      const decodeCol = ensureColumn('DECODE');
      const functionCol = ensureColumn('FUNCTION');

      const dataRow = worksheet.getRow(2);
      dataRow.getCell(codeCol).value = newCode;
      dataRow.getCell(decodeCol).value = newDecode;
      dataRow.getCell(functionCol).value = func;
      dataRow.commit();

      return workbook.xlsx.writeBuffer();
    })
    .then((updatedBuffer) => {
      // Persist to temp for later inspection
      const timestamp = Date.now();
      const tempDir = 'cypress/temp';
      const tempPath = `${tempDir}/${timestamp}-${fileName}`;
      // Ensure binary write so content is not corrupted
      cy.writeFile(tempPath, updatedBuffer, { encoding: 'binary' });
      cy.then(() => {
        Cypress.env('uploadedExcelPath', tempPath);
      });

      const updatedBlob = new Blob([updatedBuffer], { type: getMimeTypeForXlsx() });
      const testFile = new File([updatedBlob], fileName, { type: updatedBlob.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(testFile);

      cy.get('input[type=file]').then(($input) => {
        const input = $input[0] as HTMLInputElement;
        input.files = dataTransfer.files;
        cy.wrap(input).trigger('change', { force: true });
      });
    });
}

export function uploadFile(fileName: string): void {
  const xlsxMime = getMimeTypeForXlsx();

  cy.get('input[type=file]').then(($input) => {
    cy.fixture(fileName, 'base64').then((filecontent) => {
      const blob = Cypress.Blob.base64StringToBlob(filecontent, xlsxMime);
      const testFile = new File([blob], fileName, { type: xlsxMime });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(testFile);
      const input = $input[0] as HTMLInputElement;
      input.files = dataTransfer.files;
      cy.wrap(input).trigger('change', { force: true });
    });
  });

  cy.get('label.filename-label').should('have.text', fileName);
}

export function uploadNonExcelFile(fileName: string): void {
  cy.fixture(fileName, 'base64')
    .then((base64Content) => Cypress.Blob.base64StringToBlob(base64Content, 'text/plain'))
    .then((blob) => {
      const invalidFile = new File([blob], fileName, { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(invalidFile);
      cy.get('input[type=file]').then(($input) => {
        const input = $input[0] as HTMLInputElement;
        input.files = dataTransfer.files;
        cy.wrap(input).trigger('change', { force: true });
      });
    });

  cy.get('label.filename-label').should('have.text', fileName);
}