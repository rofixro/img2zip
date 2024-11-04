import JSZip from "jszip";

export function img2zip(name: string, array: string[]) {
  // 检查输入参数
  if (!array || array.length === 0) {
    throw new Error("图片数组不能为空");
  }

  // 创建一个JSZip实例
  const zip = new JSZip();

  // 处理文件名
  const zipName = name.endsWith(".zip") ? name : `${name}.zip`;

  // 创建Promise数组用于存储所有的图片下载Promise
  const promises = array.map((url, index) => {
    return fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        // 从URL中提取文件扩展名，如果无法提取则默认为.jpg
        const extension =
          url
            .split(".")
            .pop()
            ?.match(/^[a-zA-Z0-9]+/)?.[0] || "jpg";
        // 将图片添加到zip中，使用索引作为文件名
        zip.file(`image${index + 1}.${extension}`, blob);
      });
  });

  // 等待所有图片下载完成
  return Promise.all(promises)
    .then(() => {
      // 生成zip文件
      return zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });
    })
    .then((blob) => {
      // 创建下载链接并触发下载
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = zipName;
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("打包下载失败:", error);
      throw error;
    });
}
