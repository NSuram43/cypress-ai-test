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

  // Match previous working pipeline: fixture('binary') -> Blob -> ArrayBuffer -> Uint8Array
  cy.fixture(fileName, 'binary')
    .then((fileBinary) => Cypress.Blob.binaryStringToBlob(fileBinary, xlsxMime))
    .then((blob) => blob.arrayBuffer())
    .then((arrayBuffer) => new Uint8Array(arrayBuffer))
    .then((uint8) => {
      const sourceWb = new ExcelJS.Workbook();
      return sourceWb.xlsx.load(uint8);
    })
    .then((sourceWb) => {
      const sourceWs = sourceWb.worksheets[0];

      // Extract headers in order from row 1
      const headerRow = sourceWs.getRow(1);
      const headers: string[] = [];
      const headerToIndex = new Map<string, number>();
      headerRow.eachCell((cell, colNumber) => {
        const raw = cell.value;
        const headerText = (typeof raw === 'string' ? raw : String(raw ?? '')).trim();
        headers.push(headerText);
        headerToIndex.set(headerText.toUpperCase(), colNumber);
      });

      // Collect data rows as array of objects keyed by header (like sheet_to_json)
      const rowsAsObjects: Record<string, string>[] = [];
      for (let r = 2; r <= sourceWs.rowCount; r += 1) {
        const row = sourceWs.getRow(r);
        const obj: Record<string, string> = {};
        let hasAny = false;
        headers.forEach((h, idx) => {
          const col = idx + 1;
          const v = row.getCell(col).value;
          const s = v == null ? '' : typeof v === 'string' ? v : String(v);
          if (s.trim().length > 0) hasAny = true;
          obj[h] = s;
        });
        if (hasAny) rowsAsObjects.push(obj);
      }

      if (rowsAsObjects.length === 0) {
        throw new Error('No data rows found to update');
      }

      // Update first data row, mimicking jsonData[0] edits
      const first = rowsAsObjects[0];
      const set = (key: string, value: string) => {
        const match = headers.find((h) => h.trim().toUpperCase() === key);
        if (!match) throw new Error(`Required header missing: ${key}`);
        first[match] = value;
      };
      set('CODE', String(newCode));
      set('DECODE', String(newDecode));
      set('FUNCTION', String(func));

      // Build a new workbook/sheet like XLSX.book_new/json_to_sheet did
      const newWb = new ExcelJS.Workbook();
      const newWs = newWb.addWorksheet(sourceWs.name);

      // Header row
      newWs.addRow(headers);
      // Data rows
      rowsAsObjects.forEach((obj) => {
        newWs.addRow(headers.map((h) => obj[h] ?? ''));
      });

      return newWb.xlsx.writeBuffer();
    })
    .then((updatedBuffer) => {
      // Persist to a single temp file (binary string like old flow)
      const binaryString = Cypress.Blob.arrayBufferToBinaryString(updatedBuffer);
      const tempPath = 'cypress/temp/temp.xlsx';
      cy.writeFile(tempPath, binaryString, 'binary');
      cy.then(() => {
        Cypress.env('uploadedExcelPath', tempPath);
      });

      // Upload from the same binary string (keeps the working upload mechanics)
      const updatedBlob = Cypress.Blob.binaryStringToBlob(binaryString, xlsxMime);
      const testFile = new File([updatedBlob], fileName, { type: xlsxMime });
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