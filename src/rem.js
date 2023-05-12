const baseSize = 16; // 这个是设计稿中1rem的大小。
function setRem() {
  // 实际设备页面宽度和设计稿的比值
  const scale = document.documentElement.clientWidth / 1024;
  document.documentElement.style.fontSize = (baseSize * scale) + 'px'; 
  
}
setRem();
window.addEventListener('resize', () => {
  setRem();
});