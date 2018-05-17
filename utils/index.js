/**
 * lodash groupBy
 * @param {array<any>} list 
 * @param {item => key:string} fn 
 */
exports.group = (list, fn) => {
  const result = {};
  let key;
  list.forEach(item => {
    key = typeof fn === 'function' ? fn(item) : item[fn];
    result[key] ? result[key].push(item) : result[key] = [item];
  })
  return result;
};

exports.sortPath = list => {
  const tempSortList = list.map((file, index) => ({ index, file }));
  for (let index = 0; index < tempSortList.length; index++) {
    if (index > 1) {
      const a = tempSortList[index];
      if (!tempSortList[index + 1]) break;
      const b = tempSortList[index + 1];
      let path2Reg = tempSortList[b.index - 2].file;
      path2Reg = `\\/${path2Reg.slice(1).split('/').map(p => `(${p}\\/)`).join('?')}?.+`;
      const reg = new RegExp(path2Reg);
      const aMatchedLen = a.file.match(reg).filter(v => typeof v === 'string' && v !== '');
      const bMatchedLen = b.file.match(reg).filter(v => typeof v === 'string' && v !== '');

      if (bMatchedLen > aMatchedLen) {
        const temp = b;b = a;a = temp;
      }

    }
  }
  const sorted = tempSortList.map(item => item.file);
  return sorted;
}