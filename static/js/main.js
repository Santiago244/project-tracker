// JavaScript for Project Tracker

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Project Tracker loaded!');
    
    // Add click handler for API demo button
    const loadProjectsBtn = document.getElementById('loadProjectsBtn');
    if (loadProjectsBtn) {
        loadProjectsBtn.addEventListener('click', loadProjectsViaAPI);
    }
    
    // Add form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
    
    // Add character count for textareas
    const textareas = document.querySelectorAll('textarea[maxlength]');
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        const countDisplay = document.createElement('small');
        countDisplay.className = 'form-text text-muted';
        countDisplay.textContent = `0/${maxLength} characters`;
        textarea.parentNode.appendChild(countDisplay);
        
        textarea.addEventListener('input', function() {
            const currentLength = textarea.value.length;
            countDisplay.textContent = `${currentLength}/${maxLength} characters`;
            
            if (currentLength > maxLength * 0.9) {
                countDisplay.className = 'form-text text-warning';
            } else {
                countDisplay.className = 'form-text text-muted';
            }
        });
    });
});

// Function to load projects via API (demonstrates backend-frontend communication)
async function loadProjectsViaAPI() {
    const button = document.getElementById('loadProjectsBtn');
    const resultsDiv = document.getElementById('apiResults');
    
    // Show loading state
    button.textContent = 'Loading...';
    button.disabled = true;
    
    try {
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const projects = await response.json();
        
        // Display results
        resultsDiv.innerHTML = `
            <h5>📡 API Response (${projects.length} projects):</h5>
            <pre>${JSON.stringify(projects, null, 2)}</pre>
        `;
        
        console.log('Projects loaded via API:', projects);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        resultsDiv.innerHTML = `
            <div class="alert alert-danger">
                <strong>Error:</strong> Failed to load projects via API.<br>
                <small>${error.message}</small>
            </div>
        `;
    } finally {
        // Reset button
        button.textContent = 'Load Projects via API';
        button.disabled = false;
    }
}

// Function to create a new project via API (example)
async function createProjectViaAPI(projectData) {
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newProject = await response.json();
        console.log('Project created via API:', newProject);
        return newProject;
        
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
}

// Utility function to show notifications (you can extend this)
function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}