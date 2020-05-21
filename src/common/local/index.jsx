let data = {
  AbortError:
    "[中止错误］ 尽管用户和操作系统都授予了访问设备硬件的权利，而且未出现可能抛出NotReadableError异常的硬件问题，但仍然有一些问题的出现导致了设备无法被使用",
  "Permission denied": "[权限错误] 请确认浏览器允许访问麦克风与摄像头",
  NotAllowedError:
    "［拒绝错误］ 用户拒绝了当前的浏览器实例的访问请求；或者用户拒绝了当前会话的访问；或者用户在全局范围内拒绝了所有媒体访问请求",
  NotReadableError:
    "[无法读取错误］ 尽管用户已经授权使用相应的设备，操作系统上某个硬件、浏览器或者网页层面发生的错误导致设备无法被访问",
  OverConstrainedError: "［无法满足要求错误］ 指定的要求无法被设备满足 ",
};

function getLocalDict(key) {
  if (data[key]) {
    return data[key];
  } else {
    return "not found value";
  }
}

export { getLocalDict };
