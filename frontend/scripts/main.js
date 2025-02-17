const API_URL = 'http://localhost:3001/api';
const patientsContainer = document.getElementById('patientsContainer');
const patientForm = document.getElementById('patientForm');
const refreshBtn = document.getElementById('refreshBtn');

async function displayPatients() {
  try {
    patientsContainer.innerHTML = '<div class="loading">Loading patients...</div>';
    
    const response = await fetch(`${API_URL}/patients`);
    if (!response.ok) throw new Error('Failed to load patients');
    
    const patients = await response.json();
    
    patientsContainer.innerHTML = patients.length > 0 
      ? patients.map(patient => `
          <div class="patient-card">
            <h3>${patient.name}</h3>
            <p>Age: ${patient.age || 'N/A'}</p>
            <p>Diagnosis: ${patient.diagnosis}</p>
          </div>
        `).join('')
      : '<div class="info">No patients found</div>';
      
  } catch (error) {
    patientsContainer.innerHTML = `
      <div class="error">
        <h3>⚠️ Load Error</h3>
        <p>${error.message}</p>
        <button onclick="location.reload()">Reload</button>
      </div>
    `;
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value.trim(),
    age: document.getElementById('age').value,
    diagnosis: document.getElementById('diagnosis').value.trim()
  };

  try {
    if (!formData.name) throw new Error('Name is required');
    
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> Saving...';

    const response = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Save failed');
    }

    await displayPatients();
    e.target.reset();
    
  } catch (error) {
    patientsContainer.innerHTML = `
      <div class="error">
        <h3>⚠️ Save Error</h3>
        <p>${error.message}</p>
      </div>
    `;
  } finally {
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add Patient';
  }
}

// Event Listeners
patientForm.addEventListener('submit', handleSubmit);
refreshBtn.addEventListener('click', displayPatients);

// Initial Load
document.addEventListener('DOMContentLoaded', displayPatients);