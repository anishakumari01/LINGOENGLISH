const chips = document.querySelectorAll('.type-chip');
const formHint = document.getElementById('formHint');
const employeeRoleBlock = document.getElementById('employeeRoleBlock');
const languageBlock = document.getElementById('languageBlock');
const profilePicInput = document.getElementById('profilePic');
const profilePreview = document.getElementById('profilePreview');
const successMessage = document.getElementById('successMessage');
const signupForm = document.getElementById('signupForm');

function updateForm(type) {
  chips.forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.type === type);
  });

  const typeLabel =
    type === 'employee' ? 'an employee' : type === 'volunteer' ? 'a volunteer' : 'a student';

  formHint.textContent = `You are signing up as ${typeLabel}.`;
  employeeRoleBlock.classList.toggle('visible', type === 'employee');
  languageBlock.classList.toggle('visible', type === 'volunteer' || type === 'student');
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    updateForm(chip.dataset.type);
  });
});

profilePicInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    profilePreview.hidden = true;
    profilePreview.removeAttribute('src');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    profilePreview.src = reader.result;
    profilePreview.hidden = false;
  };
  reader.readAsDataURL(file);
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  const selectedType = document.querySelector('.type-chip.active').dataset.type;
  const name = formData.get('name');
  successMessage.textContent = `Thanks, ${name || 'friend'}! Your ${selectedType} account request has been received.`;
});

updateForm('employee');
