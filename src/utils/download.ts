/**
 * @author sonion
 * @description 浏览器原生下载。需要content-disposition: attachment; filename=xxx响应头支持
 * a元素、window.open；target为_self短时间打开多个，后面的会覆盖前面的。为_blank时都会拦截，但window.open可以通过返回值检测是否被拦截
 * @param {string} url - 下载链接
 */
export const browserNativeDownload = (url: string) =>
  new Promise<boolean>((resolve, reject) => {
    try {
      const newTab = window.open(url, '_blank');
      if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
        reject(new Error('Tab 可能被拦截了'));
      } else {
        resolve(true);
      }
    } catch {
      reject(new Error('下载出错'));
    }
  });

/**
 * @author sonion
 * @description blob下载
 * @param {Blob} blob - 下载的blob数据
 * @param {string} fileName - 下载的文件名
 * @param {boolean} [inline] - 是否内联下载(不开新tab) 默认内联
 */
export const blobDownload = (blob: Blob, fileName: string, inline = true) => {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    inline || a.setAttribute('target', '_blank');
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
};
