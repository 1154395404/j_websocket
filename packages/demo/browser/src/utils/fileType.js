import code from '@/assets/images/files/div-1.png'
import word from '@/assets/images/files/word-1.png'
import excel from '@/assets/images/files/excel-1.png'
import audio from '@/assets/images/files/MP3.png'
import video from '@/assets/images/files/mp4-1.png'
import pdf from '@/assets/images/files/PDF.png'
import ppt from '@/assets/images/files/ppt-1.png'
import zip from '@/assets/images/files/zip-1.png'
import file from '@/assets/images/files/wenjianjia.png'
import txt from '@/assets/images/files/txt-1.png'
import jpg from '@/assets/images/files/jpg-1.png'

// '@/assets/images/files/'

export function getFileType (suffix) {
  let result = null
  // // 匹配图片
  const imgList = ['png', 'jpg', 'jpeg', 'bmp', 'gif'] // 图片格式
  result = imgList.find(s => s === suffix)
  if (result) return 'image'
  // 匹配txt
  const txtList = ['txt']
  result = txtList.find(s => s === suffix)
  if (result) return 'txt'
  // 匹配excel
  const excelList = ['xls', 'xlsx']
  result = excelList.find(s => s === suffix)
  if (result) return 'excel'
  // 匹配word
  const wordList = ['doc', 'docx']
  result = wordList.find(s => s === suffix)
  if (result) return 'word'
  // 匹配pdf
  const pdfList = ['pdf']
  result = pdfList.find(s => s === suffix)
  if (result) return 'pdf'
  // 匹配ppt
  const pptList = ['ppt', 'pptx']
  result = pptList.find(s => s === suffix)
  if (result) return 'ppt'
  // 匹配zip
  const zipList = ['rar', 'zip', '7z']
  result = zipList.find(s => s === suffix)
  if (result) return 'zip'
  // 匹配视频
  const videoList = ['mp4', 'm2v', 'mkv', 'rmvb', 'wmv', 'avi', 'flv', 'mov', 'm4v']
  result = videoList.find(s => s === suffix)
  if (result) return 'video'
  // 匹配音频
  const radioList = ['mp3', 'wav', 'wmv', 'flac']
  result = radioList.find(s => s === suffix)
  if (result) return 'audio'
  // 匹配代码
  const codeList = ['c', 'cpp', 'h', 'java', 'js', 'html', 'css', 'py', 'php', 'cpp', 'jsx', 'tsx', 'ts', 'vue', 'json']
  result = codeList.find(s => s === suffix)
  if (result) return 'code'
  // 其他文件类型
  return 'other'
}

const fileInfo = [{
  name: '[文本文件]',
  src: txt
}, {
  name: '[表格文件]',
  src: excel
}, {
  name: '[WORD]',
  src: word
}, {
  name: '[PDF]',
  src: pdf
}, {
  name: '[PPT]',
  src: ppt
}, {
  name: '[压缩文件]',
  src: zip
}, {
  name: '[视频文件]',
  src: video
}, {
  name: '[音频文件]',
  src: audio
}, {
  name: '[源码文件]',
  src: code
}, {
  name: '[图片文件]',
  src: jpg
}, {
  name: '[文件]',
  src: file
}]

export function getFileInfo (type) {
  switch (type) {
    case 'txt':
      return fileInfo[0]
    case 'excel':
      return fileInfo[1]
    case 'word':
      return fileInfo[2]
    case 'pdf':
      return fileInfo[3]
    case 'ppt':
      return fileInfo[4]
    case 'zip':
      return fileInfo[5]
    case 'video':
      return fileInfo[6]
    case 'audio':
      return fileInfo[7]
    case 'code':
      return fileInfo[8]
    case 'image':
      return fileInfo[9]
    case 'other':
      return fileInfo[10]
  }
}
// 计算文件大小函数(保留两位小数), Size为字节大小
export function calcFileSize (size) {
  if (!size) { return '0K' }
  const num = 1024.00 // byte
  if (size < num) { return size + 'B' }
  if (size < Math.pow(num, 2)) { return (size / num).toFixed(2) + 'K' } // kb
  if (size < Math.pow(num, 3)) { return (size / Math.pow(num, 2)).toFixed(2) + 'M' } // M
  if (size < Math.pow(num, 4)) { return (size / Math.pow(num, 3)).toFixed(2) + 'G' } // G
  return (size / Math.pow(num, 4)).toFixed(2) + 'T' // T
}
