export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const downloadExcel = (blob: Blob, filename = 'report.xlsx'): void => {
  downloadBlob(blob, filename)
}

export const downloadPdf = (blob: Blob, filename = 'report.pdf'): void => {
  downloadBlob(blob, filename)
}
