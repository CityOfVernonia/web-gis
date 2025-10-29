const hello = document.querySelector('cov-hello');

hello?.addEventListener('covHelloCount', (): void => {
  console.log(`the click count is...${hello?.about().count}`);
});
