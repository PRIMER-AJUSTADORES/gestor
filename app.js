document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const appContainer = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modal = document.getElementById('modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');

    const noteModalBackdrop = document.getElementById('note-modal-backdrop');
    const noteModalForm = document.getElementById('note-modal-form');
    const noteModalCloseBtn = document.getElementById('note-modal-close-btn');
    const noteModalCancelBtn = document.getElementById('note-modal-cancel-btn');
    const noteModalTitle = document.getElementById('note-modal-title');
    const addNoteBtn = document.getElementById('add-note-btn');
    const notesContainer = document.getElementById('notes-container');

    const addProjectBtn = document.getElementById('add-project-btn');
    const projectListContainer = document.getElementById('project-list-container');
    
    const projectTitleInTasksView = document.getElementById('project-title-in-tasks-view');
    const addTaskBtn = document.getElementById('add-task-btn');
    const backToProjectsBtn = document.getElementById('back-to-projects-btn');
    const taskColumns = {
        pending: document.getElementById('pending-tasks'),
        'in-progress': document.getElementById('in-progress-tasks'),
        completed: document.getElementById('completed-tasks')
    };

    const activeTasksCountEl = document.getElementById('active-tasks-count');
    const completedTasksCountEl = document.getElementById('completed-tasks-count');
    const totalProjectsCountEl = document.getElementById('total-projects-count');
    const projectProgressContainer = document.getElementById('project-progress-container');
    const weeklyCalendarEl = document.getElementById('weekly-calendar');

    // NUEVO: To-Do List Elements
    const newTodoInput = document.getElementById('new-todo-input');
    const addTodoItemBtn = document.getElementById('add-todo-item-btn');
    const todoListContainer = document.getElementById('todo-list-container');

    // NUEVO: Eisenhower Matrix Elements
    const eisenhowerUnclassifiedList = document.getElementById('eisenhower-unclassified-list');
    const eisenhowerDoList = document.getElementById('eisenhower-do-list');
    const eisenhowerDecideList = document.getElementById('eisenhower-decide-list');
    const eisenhowerDelegateList = document.getElementById('eisenhower-delegate-list');
    const eisenhowerDeleteList = document.getElementById('eisenhower-delete-list');
    const eisenhowerQuadrants = {
        do: eisenhowerDoList,
        decide: eisenhowerDecideList,
        delegate: eisenhowerDelegateList,
        delete: eisenhowerDeleteList
    };
    const allEisenhowerLists = [eisenhowerUnclassifiedList, ...Object.values(eisenhowerQuadrants)];


    // Settings related
    const settingNameDashboardInput = document.getElementById('setting-name-dashboard');
    const settingNameProjectsInput = document.getElementById('setting-name-projects');
    const settingNameTodosInput = document.getElementById('setting-name-todos'); // NUEVO
    const settingNameEisenhowerInput = document.getElementById('setting-name-eisenhower'); // NUEVO
    const settingNameNotesInput = document.getElementById('setting-name-notes');
    const saveSectionNamesBtn = document.getElementById('save-section-names-btn');
    const colorSchemeSelector = document.getElementById('color-scheme-selector');
    const currentThemeText = document.getElementById('current-theme-text');
    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataInput = document.getElementById('import-data-input');
    const importDataBtn = document.getElementById('import-data-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');
    
    // --- App State ---
    let appData = {
        settings: {
            theme: 'dark',
            colorScheme: 'cyan-wave',
            sectionNames: {
                dashboard: 'Dashboard',
                projects: 'Proyectos',
                todos: 'Pendientes', // NUEVO
                eisenhower: 'Matriz Eisenhower', // NUEVO
                notes: 'Notas Rápidas',
                settings: 'Ajustes'
            }
        },
        projects: [], 
        quickNotes: [], 
        todos: [], // NUEVO: Para la lista de pendientes
        currentView: 'dashboard',
        currentProjectId: null, 
        editingItemId: null,
        draggedTaskInfo: null // Para Eisenhower y Kanban
    };

    const defaultProjects = [
        { name: "General", description: "Tareas y asuntos generales." },
        { name: "Mapfre", description: "Proyectos y tareas relacionados con Mapfre." },
        { name: "Zúrich", description: "Proyectos y tareas relacionados con Zúrich." },
        { name: "GMX", description: "Proyectos y tareas relacionados con GMX Seguros." },
        { name: "AXA", description: "Proyectos y tareas relacionados con AXA Seguros." },
        { name: "Primero Seguros", description: "Proyectos y tareas relacionados con Primero Seguros." }
    ];

    // --- Utility Functions ---
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);
    const saveData = () => localStorage.setItem('projectAppDataPrimerAjustadores_v2', JSON.stringify(appData)); // Nombre único para localStorage (v2 para nuevas estructuras)
    
    const loadData = () => {
        const data = localStorage.getItem('projectAppDataPrimerAjustadores_v2');
        let freshLoad = true;
        if (data) {
            appData = JSON.parse(data);
            freshLoad = false;
        }
        
        appData.settings = {
            theme: 'dark',
            colorScheme: 'cyan-wave',
            sectionNames: {
                dashboard: 'Dashboard', projects: 'Proyectos', todos: 'Pendientes',
                eisenhower: 'Matriz Eisenhower', notes: 'Notas Rápidas', settings: 'Ajustes'
            }, ...(appData.settings || {})
        };
        appData.settings.sectionNames = {
            dashboard: 'Dashboard', projects: 'Proyectos', todos: 'Pendientes',
            eisenhower: 'Matriz Eisenhower', notes: 'Notas Rápidas', settings: 'Ajustes',
            ...(appData.settings.sectionNames || {})
        };

        if (!appData.projects) appData.projects = [];
        if (!appData.quickNotes) appData.quickNotes = [];
        if (!appData.todos) appData.todos = []; // NUEVO

        // Cargar proyectos por defecto si es la primera vez o no hay proyectos
        if (freshLoad || appData.projects.length === 0) {
            appData.projects = defaultProjects.map(p => ({
                id: generateId(), name: p.name, description: p.description,
                tasks: [] // Las tareas ahora pueden tener `eisenhowerQuadrant`
            }));
        }
        // Asegurar que las tareas tengan la propiedad eisenhowerQuadrant (migración simple)
        appData.projects.forEach(project => {
            project.tasks.forEach(task => {
                if (task.eisenhowerQuadrant === undefined) {
                    task.eisenhowerQuadrant = null; // O 'unclassified'
                }
            });
        });
    };

    // --- Theme & Appearance ---
    const applyTheme = () => {
        document.body.classList.toggle('dark-mode', appData.settings.theme === 'dark');
        currentThemeText.textContent = appData.settings.theme === 'dark' ? 'Oscuro' : 'Claro';
    };

    const applyColorScheme = () => {
        const schemePrefix = 'color-scheme-';
        document.body.classList.forEach(className => {
            if (className.startsWith(schemePrefix)) document.body.classList.remove(className);
        });
        if (appData.settings.colorScheme) {
             document.body.classList.add(`${schemePrefix}${appData.settings.colorScheme}`);
        }
        colorSchemeSelector.value = appData.settings.colorScheme;
    };
    
    const updateSectionNamesUI = () => {
        document.querySelectorAll('.section-name-dashboard').forEach(el => el.textContent = appData.settings.sectionNames.dashboard);
        document.querySelectorAll('.section-name-projects').forEach(el => el.textContent = appData.settings.sectionNames.projects);
        document.querySelectorAll('.section-name-todos').forEach(el => el.textContent = appData.settings.sectionNames.todos); // NUEVO
        document.querySelectorAll('.section-name-eisenhower').forEach(el => el.textContent = appData.settings.sectionNames.eisenhower); // NUEVO
        document.querySelectorAll('.section-name-notes').forEach(el => el.textContent = appData.settings.sectionNames.notes);
        document.querySelectorAll('.section-name-settings').forEach(el => el.textContent = appData.settings.sectionNames.settings);

        settingNameDashboardInput.value = appData.settings.sectionNames.dashboard;
        settingNameProjectsInput.value = appData.settings.sectionNames.projects;
        settingNameTodosInput.value = appData.settings.sectionNames.todos; // NUEVO
        settingNameEisenhowerInput.value = appData.settings.sectionNames.eisenhower; // NUEVO
        settingNameNotesInput.value = appData.settings.sectionNames.notes;
    };

    // --- Navigation ---
    const switchView = (viewId) => {
        appData.currentView = viewId;
        views.forEach(view => view.classList.toggle('active-view', view.id === `${viewId}-view`));
        navLinks.forEach(link => link.classList.toggle('active', link.dataset.view === viewId));
        
        if (viewId === 'tasks' && !appData.currentProjectId) { switchView('projects'); return; }
        
        if (viewId === 'dashboard') renderDashboard();
        if (viewId === 'projects') renderProjects();
        if (viewId === 'tasks') renderTasksForProject(appData.currentProjectId);
        if (viewId === 'notes') renderQuickNotes();
        if (viewId === 'todos') renderTodos(); // NUEVO
        if (viewId === 'eisenhower') renderEisenhowerMatrix(); // NUEVO
        
        if (window.innerWidth <= 992 && sidebar.classList.contains('expanded')) {
            sidebar.classList.remove('expanded');
        }
        saveData(); 
    };

    // --- Modal Handling ---
    const openModal = (title, formHtml, saveHandler) => {
        modalTitle.textContent = title;
        modalForm.innerHTML = formHtml; 
        const formActions = document.createElement('div');
        formActions.className = 'form-actions';
        formActions.innerHTML = `
            <button type="button" id="modal-cancel-btn-dynamic" class="btn btn-secondary">Cancelar</button>
            <button type="submit" id="modal-save-btn-dynamic" class="btn btn-primary">Guardar</button>
        `;
        modalForm.appendChild(formActions);

        document.getElementById('modal-cancel-btn-dynamic').onclick = closeModal;
        modalForm.onsubmit = (e) => {
            e.preventDefault();
            if(saveHandler()) closeModal();
        };
        modalBackdrop.classList.remove('hidden');
    };
    const closeModal = () => {
        modalBackdrop.classList.add('hidden');
        if(modalForm) modalForm.reset();
        appData.editingItemId = null;
    };

    const openNoteModal = (note = null) => {
        appData.editingItemId = note ? note.id : null;
        noteModalTitle.textContent = note ? 'Editar Nota' : 'Nueva Nota Rápida';
        noteModalForm.elements['note-content'].value = note ? note.content : '';
        noteModalForm.elements['note-color'].value = note ? note.color : '#fff9c4';
        noteModalBackdrop.classList.remove('hidden');
    };
    const closeNoteModal = () => {
        noteModalBackdrop.classList.add('hidden');
        noteModalForm.reset();
        appData.editingItemId = null;
    };

    // --- Project Management ---
    const renderProjects = () => {
        projectListContainer.innerHTML = '';
        if (appData.projects.length === 0) {
            projectListContainer.innerHTML = '<p class="empty-state">No hay proyectos aún. ¡Crea uno para empezar!</p>';
            return;
        }
        appData.projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.dataset.id = project.id;
            projectCard.innerHTML = `
                <h3>${escapeHtml(project.name)}</h3>
                <p>${escapeHtml(project.description)}</p>
                <div class="project-card-footer">
                    <span class="task-count">${project.tasks.length} tarea(s)</span>
                    <div class="project-card-actions">
                        <button class="btn btn-secondary btn-sm edit-project-btn" title="Editar Proyecto">
                            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn btn-danger btn-sm delete-project-btn" title="Eliminar Proyecto">
                            <svg viewBox="0 0 24 24" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </div>
            `;
            projectCard.addEventListener('click', (e) => {
                if (!e.target.closest('.project-card-actions button')) {
                    appData.currentProjectId = project.id;
                    switchView('tasks');
                }
            });
            projectCard.querySelector('.edit-project-btn').addEventListener('click', (e) => {
                e.stopPropagation(); openEditProjectModal(project.id);
            });
            projectCard.querySelector('.delete-project-btn').addEventListener('click', (e) => {
                e.stopPropagation(); deleteProject(project.id);
            });
            projectListContainer.appendChild(projectCard);
        });
    };
    const openAddProjectModal = () => {
        appData.editingItemId = null;
        const formHtml = `
            <div class="form-group"><label for="project-name">Nombre del Proyecto:</label><input type="text" id="project-name" required></div>
            <div class="form-group"><label for="project-description">Descripción:</label><textarea id="project-description"></textarea></div>`;
        openModal('Nuevo Proyecto', formHtml, handleSaveProject);
    };
    const openEditProjectModal = (projectId) => {
        const project = appData.projects.find(p => p.id === projectId);
        if (!project) return;
        appData.editingItemId = projectId;
        const formHtml = `
            <div class="form-group"><label for="project-name">Nombre:</label><input type="text" id="project-name" value="${escapeHtml(project.name)}" required></div>
            <div class="form-group"><label for="project-description">Descripción:</label><textarea id="project-description">${escapeHtml(project.description)}</textarea></div>`;
        openModal('Editar Proyecto', formHtml, handleSaveProject);
    };
    const handleSaveProject = () => {
        const name = document.getElementById('project-name').value.trim();
        const description = document.getElementById('project-description').value.trim();
        if (!name) { alert('El nombre del proyecto es obligatorio.'); return false; }

        if (appData.editingItemId) { 
            const project = appData.projects.find(p => p.id === appData.editingItemId);
            if (project) { project.name = name; project.description = description; }
        } else { 
            appData.projects.push({ id: generateId(), name, description, tasks: [] });
        }
        saveData(); renderProjects(); renderDashboard(); return true; 
    };
    const deleteProject = (projectId) => {
        if (confirm('¿Eliminar este proyecto y todas sus tareas?')) {
            appData.projects = appData.projects.filter(p => p.id !== projectId);
            if (appData.currentProjectId === projectId) { appData.currentProjectId = null; switchView('projects'); }
            saveData(); renderProjects(); renderDashboard(); 
        }
    };

    // --- Task Management (Kanban) ---
    const renderTasksForProject = (projectId) => {
        const project = appData.projects.find(p => p.id === projectId);
        if (!project) { switchView('projects'); return; }
        projectTitleInTasksView.textContent = escapeHtml(project.name);
        Object.values(taskColumns).forEach(column => column.innerHTML = '');

        project.tasks.forEach(task => {
            if (task.status === 'completed' || task.status === 'in-progress' || task.status === 'pending') { // Solo mostrar estas en Kanban
                const taskCard = createTaskCard(task, project.id, 'kanban'); // 'kanban' context
                taskColumns[task.status].appendChild(taskCard);
            }
        });
        
        Object.values(taskColumns).forEach(columnEl => {
            columnEl.ondragover = dragOverHandler;
            columnEl.ondragleave = () => columnEl.classList.remove('drag-over');
            columnEl.ondrop = (e) => dropHandler(e, columnEl.parentElement.dataset.status, 'kanban');
        });
    };
    
    const createTaskCard = (task, projectId, context = 'kanban') => { // context can be 'kanban' or 'eisenhower'
        const taskCard = document.createElement('div');
        taskCard.className = `task-card priority-${task.priority}`;
        taskCard.dataset.id = task.id;
        taskCard.dataset.projectId = projectId; // Para identificar el proyecto de la tarea
        taskCard.draggable = true;
        
        let dueDateHtml = task.dueDate ? `Vence: ${new Date(task.dueDate + 'T00:00:00').toLocaleDateString()}` : 'Sin fecha';
        if (task.dueDate && new Date(task.dueDate + 'T00:00:00') < new Date().setHours(0,0,0,0) && task.status !== 'completed') {
            dueDateHtml = `<span class="task-due-date overdue">${dueDateHtml} (Vencida)</span>`;
        } else if (task.dueDate) {
            dueDateHtml = `<span class="task-due-date">${dueDateHtml}</span>`;
        }

        let tagsHtml = (task.tags && task.tags.length > 0) ? `<div class="task-tags">${task.tags.map(tag => `<span class="task-tag">${escapeHtml(tag)}</span>`).join('')}</div>` : '';
        let notesPreviewHtml = (task.notes && task.notes.trim() !== '') ? `<div class="task-notes-preview" title="Notas: ${escapeHtml(task.notes)}"><strong>Nota:</strong> ${escapeHtml(task.notes.substring(0,50))}${task.notes.length > 50 ? '...' : ''}</div>` : '';
        
        let actionsHtml = '';
        if (context === 'kanban') { // Mostrar acciones solo en Kanban
             actionsHtml = `
                <div class="task-actions">
                    <button class="btn btn-secondary btn-sm edit-task-btn" title="Editar Tarea">
                        <svg viewBox="0 0 24 24" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn btn-danger btn-sm delete-task-btn" title="Eliminar Tarea">
                         <svg viewBox="0 0 24 24" width="12" height="12"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>`;
        }

        taskCard.innerHTML = `
            <h4>${escapeHtml(task.title)}</h4>
            ${context === 'kanban' ? `<p>${escapeHtml(task.description)}</p>` : ''} 
            ${context === 'kanban' ? `<div class="task-meta"><span>Prioridad: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span> ${dueDateHtml}</div>` : ''}
            ${context === 'kanban' ? tagsHtml : ''}
            ${context === 'kanban' ? notesPreviewHtml : ''}
            ${actionsHtml}
        `;
        
        taskCard.ondragstart = (e) => dragStartHandler(e, task.id, projectId);
        taskCard.ondragend = dragEndHandler;

        if (context === 'kanban') {
            taskCard.querySelector('.edit-task-btn')?.addEventListener('click', () => openEditTaskModal(projectId, task.id));
            taskCard.querySelector('.delete-task-btn')?.addEventListener('click', () => deleteTask(projectId, task.id));
        }
        return taskCard;
    };

    const openAddTaskModal = () => {
        if (!appData.currentProjectId) return;
        appData.editingItemId = null;
        const formHtml = `
            <div class="form-group"><label for="task-title">Título:</label><input type="text" id="task-title" required></div>
            <div class="form-group"><label for="task-description">Descripción:</label><textarea id="task-description"></textarea></div>
            <div class="form-group"><label for="task-status">Estado:</label><select id="task-status"><option value="pending" selected>Pendiente</option><option value="in-progress">En Curso</option><option value="completed">Completado</option></select></div>
            <div class="form-group"><label for="task-priority">Prioridad:</label><select id="task-priority"><option value="low">Baja</option><option value="medium" selected>Media</option><option value="high">Alta</option></select></div>
            <div class="form-group"><label for="task-due-date">Vencimiento:</label><input type="date" id="task-due-date"></div>
            <div class="form-group"><label for="task-tags">Etiquetas (coma):</label><input type="text" id="task-tags" placeholder="ej: diseño, urgente"></div>
            <div class="form-group"><label for="task-notes">Notas:</label><textarea id="task-notes" placeholder="Anotaciones..."></textarea></div>`;
        openModal('Nueva Tarea', formHtml, handleSaveTask);
    };

    const openEditTaskModal = (projectId, taskId) => {
        const project = appData.projects.find(p => p.id === projectId);
        if (!project) return;
        const task = project.tasks.find(t => t.id === taskId);
        if (!task) return;
        appData.editingItemId = taskId;

        const formHtml = `
            <div class="form-group"><label for="task-title">Título:</label><input type="text" id="task-title" value="${escapeHtml(task.title)}" required></div>
            <div class="form-group"><label for="task-description">Descripción:</label><textarea id="task-description">${escapeHtml(task.description)}</textarea></div>
            <div class="form-group"><label for="task-status">Estado:</label><select id="task-status">
                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>En Curso</option>
                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completado</option></select></div>
            <div class="form-group"><label for="task-priority">Prioridad:</label><select id="task-priority">
                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Baja</option>
                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Media</option>
                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>Alta</option></select></div>
            <div class="form-group"><label for="task-due-date">Vencimiento:</label><input type="date" id="task-due-date" value="${task.dueDate || ''}"></div>
            <div class="form-group"><label for="task-tags">Etiquetas:</label><input type="text" id="task-tags" value="${task.tags ? escapeHtml(task.tags.join(', ')) : ''}"></div>
            <div class="form-group"><label for="task-notes">Notas:</label><textarea id="task-notes">${escapeHtml(task.notes || '')}</textarea></div>`;
        openModal('Editar Tarea', formHtml, handleSaveTask);
    };

    const handleSaveTask = () => {
        const projectId = appData.currentProjectId;
        const project = appData.projects.find(p => p.id === projectId);
        if (!project) return false;

        const title = document.getElementById('task-title').value.trim();
        if (!title) { alert('El título de la tarea es obligatorio.'); return false; }
        const description = document.getElementById('task-description').value.trim();
        const status = document.getElementById('task-status').value;
        const priority = document.getElementById('task-priority').value;
        const dueDate = document.getElementById('task-due-date').value;
        const tags = document.getElementById('task-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const notes = document.getElementById('task-notes').value.trim();

        if (appData.editingItemId) { 
            const task = project.tasks.find(t => t.id === appData.editingItemId);
            if (task) Object.assign(task, { title, description, status, priority, dueDate, tags, notes });
        } else { 
            project.tasks.push({ id: generateId(), title, description, status, priority, dueDate, tags, notes, eisenhowerQuadrant: null }); // Nueva tarea, sin clasificar en Eisenhower
        }
        saveData(); renderTasksForProject(projectId); renderDashboard(); renderEisenhowerMatrix(); return true; 
    };
    
    const deleteTask = (projectId, taskId) => {
        const project = appData.projects.find(p => p.id === projectId);
        if (!project) return;
        if (confirm('¿Eliminar esta tarea?')) {
            project.tasks = project.tasks.filter(t => t.id !== taskId);
            saveData(); renderTasksForProject(projectId); renderDashboard(); renderEisenhowerMatrix();
        }
    };

    const updateTaskStatus = (projectId, taskId, newStatus) => { // Para Kanban
        const project = appData.projects.find(p => p.id === projectId);
        if (!project) return;
        const task = project.tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            saveData(); renderTasksForProject(projectId); renderDashboard();
        }
    };

    // --- NUEVO: To-Do List Management ---
    const renderTodos = () => {
        todoListContainer.innerHTML = '';
        if (appData.todos.length === 0) {
            todoListContainer.innerHTML = '<p class="empty-state">No hay pendientes urgentes. ¡Añade uno!</p>';
            return;
        }
        appData.todos.forEach(todo => {
            const todoItemEl = document.createElement('div');
            todoItemEl.className = 'todo-item';
            todoItemEl.dataset.id = todo.id;
            todoItemEl.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${escapeHtml(todo.text)}</span>
                <button class="btn btn-danger btn-sm delete-todo-btn" title="Eliminar Pendiente">
                    <svg viewBox="0 0 24 24" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            todoItemEl.querySelector('.todo-checkbox').addEventListener('change', (e) => {
                toggleTodoStatus(todo.id, e.target.checked);
            });
            todoItemEl.querySelector('.delete-todo-btn').addEventListener('click', () => {
                deleteTodoItem(todo.id);
            });
            todoListContainer.appendChild(todoItemEl);
        });
    };

    const addTodoItem = () => {
        const text = newTodoInput.value.trim();
        if (!text) {
            alert('El texto del pendiente no puede estar vacío.');
            return;
        }
        appData.todos.push({ id: generateId(), text, completed: false });
        newTodoInput.value = '';
        saveData();
        renderTodos();
    };

    const toggleTodoStatus = (todoId, isCompleted) => {
        const todo = appData.todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = isCompleted;
            saveData();
            renderTodos(); // Podría optimizarse para solo actualizar el item
        }
    };

    const deleteTodoItem = (todoId) => {
        if (confirm('¿Eliminar este pendiente?')) {
            appData.todos = appData.todos.filter(t => t.id !== todoId);
            saveData();
            renderTodos();
        }
    };

    // --- NUEVO: Eisenhower Matrix Management ---
    const renderEisenhowerMatrix = () => {
        allEisenhowerLists.forEach(list => list.innerHTML = ''); // Limpiar todas las listas

        appData.projects.forEach(project => {
            project.tasks.forEach(task => {
                if (task.status === 'completed') return; // No mostrar tareas completadas en Eisenhower

                const taskCard = createTaskCard(task, project.id, 'eisenhower'); // Contexto Eisenhower

                if (task.eisenhowerQuadrant && eisenhowerQuadrants[task.eisenhowerQuadrant]) {
                    eisenhowerQuadrants[task.eisenhowerQuadrant].appendChild(taskCard);
                } else {
                    eisenhowerUnclassifiedList.appendChild(taskCard);
                }
            });
        });

        // Añadir manejadores de drag/drop a las listas de Eisenhower
        allEisenhowerLists.forEach(listEl => {
            listEl.ondragover = dragOverHandler;
            listEl.ondragleave = () => listEl.classList.remove('drag-over');
            
            let targetQuadrant = null;
            if (listEl.id === 'eisenhower-unclassified-list') {
                targetQuadrant = null; // O 'unclassified' si lo prefieres en appData
            } else {
                targetQuadrant = listEl.parentElement.dataset.quadrant;
            }
            listEl.ondrop = (e) => dropHandler(e, targetQuadrant, 'eisenhower');
        });
    };

    const updateTaskEisenhowerQuadrant = (projectId, taskId, newQuadrant) => {
        const project = appData.projects.find(p => p.id === projectId);
        if (!project) return;
        const task = project.tasks.find(t => t.id === taskId);

        if (task) {
            task.eisenhowerQuadrant = newQuadrant; // newQuadrant puede ser 'do', 'decide', 'delegate', 'delete', o null
            saveData();
            renderEisenhowerMatrix(); // Re-renderizar la matriz
            // Opcional: ¿Actualizar también estado Kanban si se mueve a 'delete'?
            // if (newQuadrant === 'delete' && task.status !== 'completed') {
            //     task.status = 'completed'; // Ejemplo
            //     renderTasksForProject(appData.currentProjectId); 
            //     renderDashboard();
            // }
        }
    };

    // --- Drag and Drop Handlers (Generalizados) ---
    const dragStartHandler = (e, taskId, projectId) => {
        appData.draggedTaskInfo = { taskId, projectId, originalSourceElement: e.target };
        e.dataTransfer.setData('text/plain', taskId); // Necesario para Firefox
        e.target.classList.add('dragging');
    };

    const dragEndHandler = (e) => {
        e.target.classList.remove('dragging');
        appData.draggedTaskInfo = null;
        // Limpiar clases 'drag-over' de todas las posibles zonas de drop
        document.querySelectorAll('.task-list.drag-over, .eisenhower-task-list.drag-over').forEach(el => el.classList.remove('drag-over'));
    };

    const dragOverHandler = (e) => {
        e.preventDefault();
        const targetList = e.target.closest('.task-list, .eisenhower-task-list');
        if (targetList) {
            targetList.classList.add('drag-over');
        }
    };
    
    const dropHandler = (e, targetValue, context) => { // targetValue es status para Kanban, quadrant para Eisenhower
        e.preventDefault();
        const targetList = e.target.closest('.task-list, .eisenhower-task-list');
        if (targetList) {
            targetList.classList.remove('drag-over');
        }

        if (!appData.draggedTaskInfo) return;
        const { taskId, projectId } = appData.draggedTaskInfo;

        if (context === 'kanban') {
            updateTaskStatus(projectId, taskId, targetValue); // targetValue es el nuevo status
        } else if (context === 'eisenhower') {
            updateTaskEisenhowerQuadrant(projectId, taskId, targetValue); // targetValue es el nuevo cuadrante
        }
    };


    // --- Quick Notes Management ---
    const renderQuickNotes = () => {
        notesContainer.innerHTML = '';
        if (appData.quickNotes.length === 0) {
            notesContainer.innerHTML = '<p class="empty-state">No hay notas rápidas. ¡Añade una!</p>'; return;
        }
        appData.quickNotes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card'; noteCard.style.backgroundColor = note.color; noteCard.dataset.id = note.id;
            noteCard.innerHTML = `
                <div class="note-content">${escapeHtml(note.content)}</div>
                <div class="note-actions">
                    <button class="btn btn-danger btn-sm delete-note-btn" title="Eliminar Nota">
                        <svg viewBox="0 0 24 24" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button></div>`;
            noteCard.querySelector('.note-content').addEventListener('click', () => openNoteModal(note));
            noteCard.querySelector('.delete-note-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteQuickNote(note.id); });
            notesContainer.appendChild(noteCard);
        });
    };
    const handleSaveQuickNote = () => {
        const content = noteModalForm.elements['note-content'].value.trim();
        const color = noteModalForm.elements['note-color'].value;
        if (!content) { alert('El contenido de la nota no puede estar vacío.'); return false; }
        if (appData.editingItemId) { 
            const note = appData.quickNotes.find(n => n.id === appData.editingItemId);
            if (note) { note.content = content; note.color = color; }
        } else { appData.quickNotes.push({ id: generateId(), content, color }); }
        saveData(); renderQuickNotes(); return true;
    };
    const deleteQuickNote = (noteId) => {
        if (confirm('¿Eliminar esta nota?')) {
            appData.quickNotes = appData.quickNotes.filter(n => n.id !== noteId);
            saveData(); renderQuickNotes();
        }
    };

    // --- Dashboard Rendering ---
    const renderDashboard = () => {
        let activeTasks = 0, completedTasks = 0;
        appData.projects.forEach(project => {
            project.tasks.forEach(task => {
                if (task.status === 'completed') completedTasks++; else activeTasks++;
            });
        });
        activeTasksCountEl.textContent = activeTasks; completedTasksCountEl.textContent = completedTasks;
        totalProjectsCountEl.textContent = appData.projects.length;
        projectProgressContainer.innerHTML = '';
        if(appData.projects.length === 0) { projectProgressContainer.innerHTML = '<p>No hay proyectos.</p>'; } 
        else {
            appData.projects.forEach(project => {
                const total = project.tasks.length, completed = project.tasks.filter(t=>t.status==='completed').length;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                const item = document.createElement('div'); item.className = 'project-progress-item';
                item.innerHTML = `<p>${escapeHtml(project.name)} (${completed}/${total})</p><div class="progress-bar-bg"><div class="progress-bar-fg" style="width: ${progress}%;">${progress}%</div></div>`;
                projectProgressContainer.appendChild(item);
            });
        }
        renderWeeklyCalendar();
    };
    const renderWeeklyCalendar = () => {
        weeklyCalendarEl.innerHTML = ''; const today = new Date();
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(today); dayDate.setDate(today.getDate() + i);
            const dayDiv = document.createElement('div'); dayDiv.className = 'calendar-day';
            const dayName = (i===0)?'Hoy':(i===1)?'Mañana':days[dayDate.getDay()];
            let tasksHtml = `<h4>${dayName} <small>(${dayDate.toLocaleDateString('es-ES', {day:'2-digit',month:'2-digit'})})</small></h4><ul>`;
            let found = false;
            appData.projects.forEach(proj => proj.tasks.forEach(task => {
                if (task.dueDate) {
                    const taskDueDate = new Date(task.dueDate + 'T00:00:00');
                    if (taskDueDate.toDateString() === dayDate.toDateString() && task.status !== 'completed') {
                        tasksHtml += `<li class="priority-${task.priority}" title="${escapeHtml(proj.name)}: ${escapeHtml(task.title)}">${escapeHtml(task.title)}</li>`;
                        found = true;
                    }
                }
            }));
            if (!found) tasksHtml += '<li><small>Sin tareas</small></li>';
            tasksHtml += '</ul>'; dayDiv.innerHTML = tasksHtml; weeklyCalendarEl.appendChild(dayDiv);
        }
    };

    // --- Settings Management ---
    const loadSettingsValues = () => {
        settingNameDashboardInput.value = appData.settings.sectionNames.dashboard;
        settingNameProjectsInput.value = appData.settings.sectionNames.projects;
        settingNameTodosInput.value = appData.settings.sectionNames.todos; // NUEVO
        settingNameEisenhowerInput.value = appData.settings.sectionNames.eisenhower; // NUEVO
        settingNameNotesInput.value = appData.settings.sectionNames.notes;
        colorSchemeSelector.value = appData.settings.colorScheme;
    };
    const handleSaveSectionNames = () => {
        appData.settings.sectionNames.dashboard = settingNameDashboardInput.value.trim() || 'Dashboard';
        appData.settings.sectionNames.projects = settingNameProjectsInput.value.trim() || 'Proyectos';
        appData.settings.sectionNames.todos = settingNameTodosInput.value.trim() || 'Pendientes'; // NUEVO
        appData.settings.sectionNames.eisenhower = settingNameEisenhowerInput.value.trim() || 'Matriz Eisenhower'; // NUEVO
        appData.settings.sectionNames.notes = settingNameNotesInput.value.trim() || 'Notas Rápidas';
        saveData(); updateSectionNamesUI(); alert('Nombres guardados.');
    };
    const handleColorSchemeChange = (e) => { appData.settings.colorScheme = e.target.value; applyColorScheme(); saveData(); };
    
    const exportData = () => {
        const dataStr = JSON.stringify(appData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const linkEl = document.createElement('a');
        linkEl.setAttribute('href', dataUri); linkEl.setAttribute('download', 'primer_ajustadores_data_v2.json');
        linkEl.click();
    };
    const importData = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (imported && imported.settings && Array.isArray(imported.projects)) {
                        if (confirm('Esto reemplazará tus datos. ¿Continuar?')) {
                            appData = imported;
                            appData.settings = { theme: 'dark', colorScheme: 'cyan-wave', sectionNames: { dashboard: 'Dashboard', projects: 'Proyectos', todos: 'Pendientes', eisenhower: 'Matriz Eisenhower', notes: 'Notas Rápidas', settings: 'Ajustes'}, ...appData.settings };
                            appData.settings.sectionNames = { dashboard: 'Dashboard', projects: 'Proyectos', todos: 'Pendientes', eisenhower: 'Matriz Eisenhower', notes: 'Notas Rápidas', settings: 'Ajustes', ...appData.settings.sectionNames };
                            if (!appData.quickNotes) appData.quickNotes = [];
                            if (!appData.todos) appData.todos = []; // NUEVO
                            if (!appData.projects) appData.projects = [];
                             appData.projects.forEach(p => p.tasks.forEach(t => { if(t.eisenhowerQuadrant === undefined) t.eisenhowerQuadrant = null; })); // NUEVO: Ensure eisenhowerQuadrant
                            saveData(); initializeUI(); switchView(appData.currentView || 'dashboard'); alert('Datos importados.');
                        }
                    } else alert('Archivo inválido.');
                } catch (err) { alert('Error al leer: ' + err.message); }
                importDataInput.value = ''; 
            };
            reader.readAsText(file);
        }
    };
    const clearAllData = () => {
        if (confirm('¡ADVERTENCIA! Borrará TODOS los datos. ¿Seguro?')) {
            localStorage.removeItem('projectAppDataPrimerAjustadores_v2');
            appData = {
                settings: { theme: 'dark', colorScheme: 'cyan-wave', sectionNames: { dashboard: 'Dashboard', projects: 'Proyectos', todos: 'Pendientes', eisenhower: 'Matriz Eisenhower', notes: 'Notas Rápidas', settings: 'Ajustes' }},
                projects: defaultProjects.map(p => ({ id: generateId(), name: p.name, description: p.description, tasks: [] })),
                quickNotes: [], todos: [], currentView: 'dashboard', currentProjectId: null, editingItemId: null
            };
            saveData(); initializeUI(); switchView('dashboard'); alert('Datos borrados. Proyectos por defecto cargados.');
        }
    };
    
    // --- Event Listeners Setup ---
    const setupEventListeners = () => {
        sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('expanded'));
        mainContent.addEventListener('click', () => {
            if (window.innerWidth <= 992 && sidebar.classList.contains('expanded')) sidebar.classList.remove('expanded');
        });
        navLinks.forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); switchView(link.dataset.view); }));
        themeToggleBtn.addEventListener('click', () => {
            appData.settings.theme = appData.settings.theme === 'light' ? 'dark' : 'light';
            applyTheme(); saveData();
        });
        modalCloseBtn.addEventListener('click', closeModal);
        document.getElementById('modal-cancel-btn-inner')?.addEventListener('click', closeModal);
        modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });
        noteModalCloseBtn.addEventListener('click', closeNoteModal);
        noteModalCancelBtn.addEventListener('click', closeNoteModal);
        noteModalBackdrop.addEventListener('click', (e) => { if (e.target === noteModalBackdrop) closeNoteModal(); });
        noteModalForm.addEventListener('submit', (e) => { e.preventDefault(); if (handleSaveQuickNote()) closeNoteModal(); });
        addProjectBtn.addEventListener('click', openAddProjectModal);
        addTaskBtn.addEventListener('click', openAddTaskModal);
        addNoteBtn.addEventListener('click', () => openNoteModal());
        backToProjectsBtn.addEventListener('click', () => { appData.currentProjectId = null; switchView('projects'); });
        saveSectionNamesBtn.addEventListener('click', handleSaveSectionNames);
        colorSchemeSelector.addEventListener('change', handleColorSchemeChange);
        exportDataBtn.addEventListener('click', exportData);
        importDataBtn.addEventListener('click', () => importDataInput.click());
        importDataInput.addEventListener('change', importData);
        clearDataBtn.addEventListener('click', clearAllData);

        // NUEVO: Event Listeners para To-Do List
        addTodoItemBtn.addEventListener('click', addTodoItem);
        newTodoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodoItem();
        });
    };
    
    function escapeHtml(unsafe) {
        if (unsafe === null || typeof unsafe === 'undefined') return '';
        return String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    const initializeUI = () => {
        applyTheme(); applyColorScheme(); updateSectionNamesUI(); loadSettingsValues(); 
        const initialView = appData.currentView || 'dashboard';
        switchView('placeholder'); // Truco para forzar re-evaluación
        switchView(initialView); 
    };

    const initApp = () => { loadData(); setupEventListeners(); initializeUI(); };
    initApp();
});