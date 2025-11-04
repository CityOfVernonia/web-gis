const select = document.querySelector('header calcite-select') as HTMLCalciteSelectElement;

select.addEventListener('calciteSelectChange', (): void => {
  const value = select.value as ':root' | 'light' | 'dark';

  document.body.classList.remove('calcite-mode-light', 'calcite-mode-dark');

  if (value === 'light') {
    document.body.classList.add('calcite-mode-light');
  }

  if (value === 'dark') {
    document.body.classList.add('calcite-mode-dark');
  }
});
