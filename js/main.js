document.addEventListener('DOMContentLoaded',()=>{

  /* floating labels */
  document.querySelectorAll('.form-group input, .form-group textarea')
    .forEach(el=>{
      if(el.value) el.classList.add('filled');
      el.addEventListener('input',()=>el.classList.toggle('filled',!!el.value));
    });

  /* dynamic address/email controls */
  const dyn=(sel,label)=>{
    const box=document.querySelector(sel);
    document.querySelector(sel+'-btn')
      .addEventListener('click',()=>{
        const wrap=document.createElement('div');
        wrap.className='form-group';
        wrap.innerHTML=`<input type="${sel.includes('address')?'text':'email'}" name="${sel.slice(1)}[]" placeholder=" " required>
                        <label>${label}</label>
                        <button type="button" class="add-btn rem">×</button>`;
        wrap.querySelector('.rem').addEventListener('click',()=>wrap.remove());
        box.append(wrap);
      });
  };
  dyn('#address-container','Place your address');
  dyn('#email-container','Place your email');

});
