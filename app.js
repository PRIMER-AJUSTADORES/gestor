document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    const modalCloseBtn = document.getElementById('modal-close-btn');

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

    const newTodoInput = document.getElementById('new-todo-input');
    const addTodoItemBtn = document.getElementById('add-todo-item-btn');
    const todoListContainer = document.getElementById('todo-list-container');

    const eisenhowerProjectFilter = document.getElementById('eisenhower-project-filter');
    const eisenhowerUnclassifiedList = document.getElementById('eisenhower-unclassified-list');
    const eisenhowerDoList = document.getElementById('eisenhower-do-list');
    const eisenhowerDecideList = document.getElementById('eisenhower-decide-list');
    const eisenhowerDelegateList = document.getElementById('eisenhower-delegate-list');
    const eisenhowerDeleteList = document.getElementById('eisenhower-delete-list');
    const eisenhowerQuadrants = {
        do: eisenhowerDoList, decide: eisenhowerDecideList,
        delegate: eisenhowerDelegateList, delete: eisenhowerDeleteList
    };
    const allEisenhowerLists = [eisenhowerUnclassifiedList, ...Object.values(eisenhowerQuadrants)];

    const settingNameDashboardInput = document.getElementById('setting-name-dashboard');
    const settingNameProjectsInput = document.getElementById('setting-name-projects');
    const settingNameTodosInput = document.getElementById('setting-name-todos'); 
    const settingNameEisenhowerInput = document.getElementById('setting-name-eisenhower'); 
    const settingNameNotesInput = document.getElementById('setting-name-notes');
    const saveSectionNamesBtn = document.getElementById('save-section-names-btn');
    const colorSchemeSelector = document.getElementById('color-scheme-selector');
    const currentThemeText = document.getElementById('current-theme-text');
    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataInput = document.getElementById('import-data-input');
    const importDataBtn = document.getElementById('import-data-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');

    const notificationModalBackdrop = document.getElementById('notification-modal-backdrop');
    const notificationModalTitle = document.getElementById('notification-modal-title');
    const notificationModalMessage = document.getElementById('notification-modal-message');
    const notificationModalOkBtn = document.getElementById('notification-modal-ok-btn');
    const notificationModalCancelBtn = document.getElementById('notification-modal-cancel-btn');
    
    // --- App State ---
    let appData = {
        settings: {
            theme: 'dark', colorScheme: 'cyan-wave',
            sectionNames: {
                dashboard: 'Dashboard', projects: 'Proyectos', todos: 'Pendientes',
                eisenhower: 'Matriz Eisenhower', notes: 'Notas Rápidas', settings: 'Ajustes'
            }
        },
        projects: [], quickNotes: [], todos: [], 
        currentView: 'dashboard', currentProjectId: null, editingItemId: null,
        draggedTaskInfo: null 
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
    const saveData = () => localStorage.setItem('projectAppDataPrimerAjustadores_v3', JSON.stringify(appData));
    
    const loadData = () => {
        const data = localStorage.getItem('projectAppDataPrimerAjustadores_v3');
        let freshLoad = true;
        if (data) { appData = JSON.parse(data); freshLoad = false; }
        
        appData.settings = {
            theme: 'dark', colorScheme: 'cyan-wave',
            sectionNames: { dashboard: 'Dashboard', projects: 'Proyectos', todos: 'Pendientes', eisenhower: 'Matriz Eisenhower', notes: 'Notas Rápidas', settings: 'Ajustes'},
            ...(appData.settings || {})
        };
        appData.settings.sectionNames = {
             dashboard: 'Dashboard', projects: 'Proyectos', todos: 'Pendientes', eisenhower: 'Matriz Eisenhower', notes: 'Notas Rápidas', settings: 'Ajustes',
            ...(appData.settings.sectionNames || {})
        };
        if (!appData.projects) appData.projects = [];
        if (!appData.quickNotes) appData.quickNotes = [];
        if (!appData.todos) appData.todos = [];

        if (freshLoad || appData.projects.length === 0) {
            appData.projects = defaultProjects.map(p => ({ id: generateId(), name: p.name, description: p.description, tasks: [] }));
        }
        appData.projects.forEach(project => project.tasks.forEach(task => { if (task.eisenhowerQuadrant === undefined) task.eisenhowerQuadrant = null; }));
    };

    // --- Theme & Appearance ---
    const applyTheme = () => {
        document.body.classList.toggle('dark-mode', appData.settings.theme === 'dark');
        currentThemeText.textContent = appData.settings.theme === 'dark' ? 'Oscuro' : 'Claro';
    };
    const applyColorScheme = () => {
        const prefix = 'color-scheme-';
        document.body.classList.forEach(cn => { if (cn.startsWith(prefix)) document.body.classList.remove(cn); });
        if (appData.settings.colorScheme) document.body.classList.add(`${prefix}${appData.settings.colorScheme}`);
        colorSchemeSelector.value = appData.settings.colorScheme;
    };
    const updateSectionNamesUI = () => {
        document.querySelectorAll('.section-name-dashboard').forEach(el => el.textContent = appData.settings.sectionNames.dashboard);
        document.querySelectorAll('.section-name-projects').forEach(el => el.textContent = appData.settings.sectionNames.projects);
        document.querySelectorAll('.section-name-todos').forEach(el => el.textContent = appData.settings.sectionNames.todos);
        document.querySelectorAll('.section-name-eisenhower').forEach(el => el.textContent = appData.settings.sectionNames.eisenhower);
        document.querySelectorAll('.section-name-notes').forEach(el => el.textContent = appData.settings.sectionNames.notes);
        document.querySelectorAll('.section-name-settings').forEach(el => el.textContent = appData.settings.sectionNames.settings);
        settingNameDashboardInput.value = appData.settings.sectionNames.dashboard;
        settingNameProjectsInput.value = appData.settings.sectionNames.projects;
        settingNameTodosInput.value = appData.settings.sectionNames.todos;
        settingNameEisenhowerInput.value = appData.settings.sectionNames.eisenhower;
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
        if (viewId === 'todos') renderTodos();
        if (viewId === 'eisenhower') renderEisenhowerMatrix();
        if (window.innerWidth <= 992 && sidebar.classList.contains('expanded')) sidebar.classList.remove('expanded');
        saveData(); 
    };

    // --- Custom Notifications ---
    let confirmResolve = null;
    const showCustomAlert = (message, title = 'Notificación') => {
        notificationModalTitle.textContent = title;
        notificationModalMessage.textContent = message;
        notificationModalOkBtn.textContent = 'OK';
        notificationModalCancelBtn.style.display = 'none';
        notificationModalBackdrop.classList.remove('hidden');
        return new Promise((resolve) => {
            notificationModalOkBtn.onclick = () => {
                notificationModalBackdrop.classList.add('hidden');
                resolve(true);
            };
        });
    };
    const showCustomConfirm = (message, title = 'Confirmación') => {
        notificationModalTitle.textContent = title;
        notificationModalMessage.textContent = message;
        notificationModalOkBtn.textContent = 'Aceptar';
        notificationModalCancelBtn.style.display = 'inline-flex';
        notificationModalCancelBtn.textContent = 'Cancelar';
        notificationModalBackdrop.classList.remove('hidden');
        return new Promise((resolve) => {
            confirmResolve = resolve;
            notificationModalOkBtn.onclick = () => {
                notificationModalBackdrop.classList.add('hidden');
                if (confirmResolve) confirmResolve(true);
                confirmResolve = null;
            };
            notificationModalCancelBtn.onclick = () => {
                notificationModalBackdrop.classList.add('hidden');
                if (confirmResolve) confirmResolve(false);
                confirmResolve = null;
            };
        });
    };


    // --- Modal Handling (General Purpose) ---
    const openModal = (title, formHtml, saveHandler) => {
        modalTitle.textContent = title;
        modalForm.innerHTML = formHtml; 
        const formActions = document.createElement('div');
        formActions.className = 'form-actions';
        formActions.innerHTML = `
            <button type="button" id="modal-cancel-btn-dynamic" class="btn btn-secondary">Cancelar</button>
            <button type="submit" id="modal-save-btn-dynamic" class="btn btn-primary">Guardar</button>`;
        modalForm.appendChild(formActions);
        document.getElementById('modal-cancel-btn-dynamic').onclick = closeModal;
        modalForm.onsubmit = async (e) => { 
            e.preventDefault();
            if(await saveHandler()) closeModal(); 
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
            projectListContainer.innerHTML = '<p class="empty-state">No hay proyectos aún.</p>'; return;
        }
        appData.projects.forEach(project => {
            const card = document.createElement('div'); card.className = 'project-card'; card.dataset.id = project.id;
            card.innerHTML = `
                <h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.description)}</p>
                <div class="project-card-footer"><span class="task-count">${project.tasks.length} tarea(s)</span>
                <div class="project-card-actions">
                    <button class="btn btn-secondary btn-sm edit-project-btn" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                    <button class="btn btn-danger btn-sm delete-project-btn" title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                </div></div>`;
            card.addEventListener('click', (e) => { if (!e.target.closest('.project-card-actions button')) { appData.currentProjectId = project.id; switchView('tasks'); }});
            card.querySelector('.edit-project-btn').addEventListener('click', (e) => { e.stopPropagation(); openEditProjectModal(project.id); });
            card.querySelector('.delete-project-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteProject(project.id); });
            projectListContainer.appendChild(card);
        });
    };
    const openAddProjectModal = () => {
        appData.editingItemId = null;
        openModal('Nuevo Proyecto', `
            <div class="form-group"><label for="project-name">Nombre:</label><input type="text" id="project-name" required></div>
            <div class="form-group"><label for="project-description">Descripción:</label><textarea id="project-description"></textarea></div>`, 
            handleSaveProject);
    };
    const openEditProjectModal = (projectId) => {
        const p = appData.projects.find(proj => proj.id === projectId); if (!p) return;
        appData.editingItemId = projectId;
        openModal('Editar Proyecto', `
            <div class="form-group"><label for="project-name">Nombre:</label><input type="text" id="project-name" value="${escapeHtml(p.name)}" required></div>
            <div class="form-group"><label for="project-description">Descripción:</label><textarea id="project-description">${escapeHtml(p.description)}</textarea></div>`,
            handleSaveProject);
    };
    const handleSaveProject = async () => {
        const name = document.getElementById('project-name').value.trim();
        const description = document.getElementById('project-description').value.trim(); // Renamed from 'desc' to 'description' for consistency
        if (!name) { await showCustomAlert('El nombre del proyecto es obligatorio.'); return false; }
        if (appData.editingItemId) {
            const p = appData.projects.find(proj => proj.id === appData.editingItemId);
            if (p) { p.name = name; p.description = description; }
        } else { appData.projects.push({ id: generateId(), name, description, tasks: [] }); }
        saveData(); renderProjects(); renderDashboard(); return true; 
    };
    const deleteProject = async (projectId) => {
        if (await showCustomConfirm('¿Eliminar este proyecto y todas sus tareas?')) {
            appData.projects = appData.projects.filter(p => p.id !== projectId);
            if (appData.currentProjectId === projectId) { appData.currentProjectId = null; switchView('projects'); }
            saveData(); renderProjects(); renderDashboard(); renderEisenhowerMatrix();
        }
    };

    // --- Task Management (Kanban & Eisenhower support) ---
    const renderTasksForProject = (projectId) => { // For Kanban View
        const proj = appData.projects.find(p => p.id === projectId);
        if (!proj) { switchView('projects'); return; }
        projectTitleInTasksView.textContent = escapeHtml(proj.name);
        Object.values(taskColumns).forEach(col => col.innerHTML = '');
        proj.tasks.forEach(task => {
            if (['pending', 'in-progress', 'completed'].includes(task.status)) {
                const card = createTaskCard(task, proj.id, 'kanban');
                taskColumns[task.status].appendChild(card);
            }
        });
        Object.values(taskColumns).forEach(colEl => {
            colEl.ondragover = dragOverHandler;
            colEl.ondragleave = () => colEl.classList.remove('drag-over');
            colEl.ondrop = (e) => dropHandler(e, colEl.parentElement.dataset.status, 'kanban');
        });
    };
    const createTaskCard = (task, projectId, context = 'kanban') => {
        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority}`;
        card.dataset.id = task.id; card.dataset.projectId = projectId; card.draggable = true;
        let dueHTML = task.dueDate ? `Vence: ${new Date(task.dueDate+'T00:00:00').toLocaleDateString()}` : 'Sin fecha';
        if (task.dueDate && new Date(task.dueDate+'T00:00:00') < new Date().setHours(0,0,0,0) && task.status !== 'completed') {
            dueHTML = `<span class="task-due-date overdue">${dueHTML} (Vencida)</span>`;
        } else if (task.dueDate) dueHTML = `<span class="task-due-date">${dueHTML}</span>`;
        
        let tagsHTML = (task.tags && task.tags.length) ? `<div class="task-tags">${task.tags.map(t => `<span class="task-tag">${escapeHtml(t)}</span>`).join('')}</div>` : '';
        let notesHTML = (task.notes && task.notes.trim()) ? `<div class="task-notes-preview" title="Notas: ${escapeHtml(task.notes)}"><strong>Nota:</strong> ${escapeHtml(task.notes.substring(0,50))}${task.notes.length > 50 ? '...' : ''}</div>` : '';
        let actionsHTML = (context === 'kanban') ? `
            <div class="task-actions">
                <button class="btn btn-secondary btn-sm edit-task-btn" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                <button class="btn btn-danger btn-sm delete-task-btn" title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
            </div>` : '';
        card.innerHTML = `<h4>${escapeHtml(task.title)}</h4>
            ${context === 'kanban' ? `<p>${escapeHtml(task.description)}</p><div class="task-meta"><span>Prioridad: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span> ${dueHTML}</div>${tagsHTML}${notesHTML}` : ''}
            ${actionsHTML}`;
        card.ondragstart = (e) => dragStartHandler(e, task.id, projectId);
        card.ondragend = dragEndHandler;
        if (context === 'kanban') {
            card.querySelector('.edit-task-btn')?.addEventListener('click', () => openEditTaskModal(projectId, task.id));
            card.querySelector('.delete-task-btn')?.addEventListener('click', () => deleteTask(projectId, task.id));
        }
        return card;
    };
    const openAddTaskModal = () => {
        if (!appData.currentProjectId) return; appData.editingItemId = null;
        openModal('Nueva Tarea', `
            <div class="form-group"><label for="task-title">Título:</label><input type="text" id="task-title" required></div>
            <div class="form-group"><label for="task-description">Descripción:</label><textarea id="task-description"></textarea></div>
            <div class="form-group"><label for="task-status">Estado:</label><select id="task-status"><option value="pending" selected>Pendiente</option><option value="in-progress">En Curso</option><option value="completed">Completado</option></select></div>
            <div class="form-group"><label for="task-priority">Prioridad:</label><select id="task-priority"><option value="low">Baja</option><option value="medium" selected>Media</option><option value="high">Alta</option></select></div>
            <div class="form-group"><label for="task-due-date">Vencimiento:</label><input type="date" id="task-due-date"></div>
            <div class="form-group"><label for="task-tags">Etiquetas (coma):</label><input type="text" id="task-tags" placeholder="ej: diseño, urgente"></div>
            <div class="form-group"><label for="task-notes">Notas:</label><textarea id="task-notes" placeholder="Anotaciones..."></textarea></div>`,
            handleSaveTask);
    };
    const openEditTaskModal = (projectId, taskId) => {
        const proj = appData.projects.find(p => p.id === projectId); if (!proj) return;
        const task = proj.tasks.find(t => t.id === taskId); if (!task) return;
        appData.editingItemId = taskId;
        openModal('Editar Tarea', `
            <div class="form-group"><label for="task-title">Título:</label><input type="text" id="task-title" value="${escapeHtml(task.title)}" required></div>
            <div class="form-group"><label for="task-description">Descripción:</label><textarea id="task-description">${escapeHtml(task.description)}</textarea></div>
            <div class="form-group"><label for="task-status">Estado:</label><select id="task-status"><option value="pending" ${task.status==='pending'?'selected':''}>Pendiente</option><option value="in-progress" ${task.status==='in-progress'?'selected':''}>En Curso</option><option value="completed" ${task.status==='completed'?'selected':''}>Completado</option></select></div>
            <div class="form-group"><label for="task-priority">Prioridad:</label><select id="task-priority"><option value="low" ${task.priority==='low'?'selected':''}>Baja</option><option value="medium" ${task.priority==='medium'?'selected':''}>Media</option><option value="high" ${task.priority==='high'?'selected':''}>Alta</option></select></div>
            <div class="form-group"><label for="task-due-date">Vencimiento:</label><input type="date" id="task-due-date" value="${task.dueDate||''}"></div>
            <div class="form-group"><label for="task-tags">Etiquetas:</label><input type="text" id="task-tags" value="${task.tags?escapeHtml(task.tags.join(', ')):''}"></div>
            <div class="form-group"><label for="task-notes">Notas:</label><textarea id="task-notes">${escapeHtml(task.notes||'')}</textarea></div>`,
            handleSaveTask);
    };
    const handleSaveTask = async () => { // Marked as async
        const projId = appData.currentProjectId;
        const proj = appData.projects.find(p => p.id === projId); if (!proj) return false;
        const title = document.getElementById('task-title').value.trim();
        if (!title) { await showCustomAlert('El título es obligatorio.'); return false; }
        
        // **** CORRECCIÓN AQUÍ ****
        const description = document.getElementById('task-description').value.trim(); // Cambiado de 'desc' a 'description'
        // **** FIN DE CORRECCIÓN ****

        const status = document.getElementById('task-status').value;
        const priority = document.getElementById('task-priority').value;
        const dueDate = document.getElementById('task-due-date').value;
        const tags = document.getElementById('task-tags').value.split(',').map(t=>t.trim()).filter(t=>t);
        const notes = document.getElementById('task-notes').value.trim();

        if (appData.editingItemId) {
            const task = proj.tasks.find(t => t.id === appData.editingItemId);
            if (task) Object.assign(task, {title,description,status,priority,dueDate,tags,notes});
        } else { 
            proj.tasks.push({id:generateId(),title,description,status,priority,dueDate,tags,notes,eisenhowerQuadrant:null}); 
        }
        saveData(); renderTasksForProject(projId); renderDashboard(); renderEisenhowerMatrix(); return true; 
    };
    const deleteTask = async (projectId, taskId) => { // Marked as async
        const proj = appData.projects.find(p => p.id === projectId); if (!proj) return;
        if (await showCustomConfirm('¿Eliminar esta tarea?')) {
            proj.tasks = proj.tasks.filter(t => t.id !== taskId);
            saveData(); renderTasksForProject(projectId); renderDashboard(); renderEisenhowerMatrix();
        }
    };
    const updateTaskStatus = (projectId, taskId, newStatus) => { // For Kanban
        const proj = appData.projects.find(p => p.id === projectId); if (!proj) return;
        const task = proj.tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus; saveData(); renderTasksForProject(projectId); renderDashboard();
        }
    };

    // --- To-Do List Management ---
    const renderTodos = () => {
        todoListContainer.innerHTML = '';
        if (appData.todos.length === 0) {
            todoListContainer.innerHTML = '<p class="empty-state">No hay pendientes urgentes.</p>'; return;
        }
        appData.todos.forEach(todo => {
            const itemEl = document.createElement('div'); itemEl.className = 'todo-item'; itemEl.dataset.id = todo.id;
            itemEl.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed?'checked':''}>
                <span class="todo-text ${todo.completed?'completed':''}">${escapeHtml(todo.text)}</span>
                <button class="btn btn-danger btn-sm delete-todo-btn" title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`;
            itemEl.querySelector('.todo-checkbox').addEventListener('change', (e)=>toggleTodoStatus(todo.id,e.target.checked));
            itemEl.querySelector('.delete-todo-btn').addEventListener('click', ()=>deleteTodoItem(todo.id));
            todoListContainer.appendChild(itemEl);
        });
    };
    const addTodoItem = async () => { // Marked as async
        const text = newTodoInput.value.trim();
        if (!text) { await showCustomAlert('El texto del pendiente no puede estar vacío.'); return; }
        appData.todos.push({id:generateId(),text,completed:false}); newTodoInput.value='';
        saveData(); renderTodos();
    };
    const toggleTodoStatus = (todoId, isCompleted) => {
        const todo = appData.todos.find(t => t.id === todoId);
        if (todo) { todo.completed = isCompleted; saveData(); renderTodos(); }
    };
    const deleteTodoItem = async (todoId) => { // Marked as async
        if (await showCustomConfirm('¿Eliminar este pendiente?')) {
            appData.todos = appData.todos.filter(t => t.id !== todoId);
            saveData(); renderTodos();
        }
    };

    // --- Eisenhower Matrix Management ---
    const renderEisenhowerMatrix = () => {
        allEisenhowerLists.forEach(list => list.innerHTML = '');
        
        const currentFilterValue = eisenhowerProjectFilter.value; // Save current filter selection
        eisenhowerProjectFilter.innerHTML='<option value="all">Todos los proyectos</option>'; // Clear and add default
        appData.projects.forEach(p => {
            const opt = document.createElement('option'); 
            opt.value=p.id; opt.textContent=p.name; eisenhowerProjectFilter.appendChild(opt);
        });
        if (appData.projects.find(p => p.id === currentFilterValue)) { // If old selection still valid
            eisenhowerProjectFilter.value = currentFilterValue;
        } else {
            eisenhowerProjectFilter.value = 'all'; // Default to all if old project was deleted
        }
        
        const selectedProjId = eisenhowerProjectFilter.value;

        appData.projects.forEach(proj => {
            if (selectedProjId !== 'all' && proj.id !== selectedProjId) return; // Apply filter
            proj.tasks.forEach(task => {
                if (task.status === 'completed') return; // Don't show completed tasks
                const card = createTaskCard(task, proj.id, 'eisenhower');
                if (task.eisenhowerQuadrant && eisenhowerQuadrants[task.eisenhowerQuadrant]) {
                    eisenhowerQuadrants[task.eisenhowerQuadrant].appendChild(card);
                } else eisenhowerUnclassifiedList.appendChild(card);
            });
        });
        allEisenhowerLists.forEach(listEl => {
            listEl.ondragover = dragOverHandler;
            listEl.ondragleave = () => listEl.classList.remove('drag-over');
            let targetQuad = null;
            if (listEl.id !== 'eisenhower-unclassified-list') targetQuad = listEl.parentElement.dataset.quadrant;
            listEl.ondrop = (e) => dropHandler(e, targetQuad, 'eisenhower');
        });
    };
    const updateTaskEisenhowerQuadrant = (projectId, taskId, newQuadrant) => {
        const proj = appData.projects.find(p => p.id === projectId); if (!proj) return;
        const task = proj.tasks.find(t => t.id === taskId);
        if (task) { task.eisenhowerQuadrant = newQuadrant; saveData(); renderEisenhowerMatrix(); }
    };

    // --- Drag and Drop Handlers ---
    const dragStartHandler = (e, taskId, projectId) => {
        appData.draggedTaskInfo = { taskId, projectId };
        e.dataTransfer.setData('text/plain', taskId); 
        setTimeout(() => e.target.classList.add('dragging'), 0);
    };
    const dragEndHandler = (e) => {
        if (e.target && typeof e.target.classList !== 'undefined') { // Check if e.target is a valid element
            e.target.classList.remove('dragging');
        }
        appData.draggedTaskInfo = null;
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    };
    const dragOverHandler = (e) => {
        e.preventDefault();
        const list = e.target.closest('.task-list, .eisenhower-task-list');
        // Clear previous drag-over classes before adding to current
        document.querySelectorAll('.drag-over').forEach(el => {
            if (el !== list) el.classList.remove('drag-over');
        });
        if (list) list.classList.add('drag-over');
    };
    const dropHandler = (e, targetValue, context) => {
        e.preventDefault();
        const list = e.target.closest('.task-list, .eisenhower-task-list');
        if (list) list.classList.remove('drag-over');
        if (!appData.draggedTaskInfo) return;
        const { taskId, projectId } = appData.draggedTaskInfo;
        if (context === 'kanban') updateTaskStatus(projectId, taskId, targetValue);
        else if (context === 'eisenhower') updateTaskEisenhowerQuadrant(projectId, taskId, targetValue);
    };

    // --- Quick Notes Management ---
    const renderQuickNotes = () => {
        notesContainer.innerHTML = '';
        if (appData.quickNotes.length === 0) {
            notesContainer.innerHTML = '<p class="empty-state">No hay notas rápidas.</p>'; return;
        }
        appData.quickNotes.forEach(note => {
            const card = document.createElement('div'); card.className = 'note-card'; card.style.backgroundColor = note.color; card.dataset.id = note.id;
            card.innerHTML = `
                <div class="note-content">${escapeHtml(note.content)}</div>
                <div class="note-actions">
                    <button class="btn btn-danger btn-sm delete-note-btn" title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>`;
            card.querySelector('.note-content').addEventListener('click', ()=>openNoteModal(note));
            card.querySelector('.delete-note-btn').addEventListener('click', (e)=>{e.stopPropagation();deleteQuickNote(note.id);});
            notesContainer.appendChild(card);
        });
    };
    const handleSaveQuickNote = async () => { // Marked as async
        const content = noteModalForm.elements['note-content'].value.trim();
        const color = noteModalForm.elements['note-color'].value;
        if (!content) { await showCustomAlert('El contenido no puede estar vacío.'); return false; }
        if (appData.editingItemId) {
            const note = appData.quickNotes.find(n => n.id === appData.editingItemId);
            if (note) { note.content = content; note.color = color; }
        } else appData.quickNotes.push({ id: generateId(), content, color });
        saveData(); renderQuickNotes(); return true;
    };
    const deleteQuickNote = async (noteId) => { // Marked as async
        if (await showCustomConfirm('¿Eliminar esta nota?')) {
            appData.quickNotes = appData.quickNotes.filter(n => n.id !== noteId);
            saveData(); renderQuickNotes();
        }
    };

    // --- Dashboard Rendering ---
    const renderDashboard = () => {
        let activeT = 0, completedT = 0;
        appData.projects.forEach(p => p.tasks.forEach(t => { if (t.status === 'completed') completedT++; else activeT++; }));
        activeTasksCountEl.textContent=activeT; completedTasksCountEl.textContent=completedT;
        totalProjectsCountEl.textContent=appData.projects.length;
        projectProgressContainer.innerHTML = '';
        if(appData.projects.length === 0) projectProgressContainer.innerHTML = '<p>No hay proyectos.</p>';
        else appData.projects.forEach(p => {
            const total=p.tasks.length, comp=p.tasks.filter(t=>t.status==='completed').length;
            const prog = total > 0 ? Math.round((comp/total)*100):0;
            const item = document.createElement('div'); item.className='project-progress-item';
            item.innerHTML = `<p>${escapeHtml(p.name)} (${comp}/${total})</p><div class="progress-bar-bg"><div class="progress-bar-fg" style="width:${prog}%;">${prog}%</div></div>`;
            projectProgressContainer.appendChild(item);
        });
        renderWeeklyCalendar();
    };
    const renderWeeklyCalendar = () => {
        weeklyCalendarEl.innerHTML = ''; const today = new Date();
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        for (let i = 0; i < 7; i++) {
            const dDate = new Date(today); dDate.setDate(today.getDate() + i);
            const dDiv = document.createElement('div'); dDiv.className = 'calendar-day';
            const dName = (i===0)?'Hoy':(i===1)?'Mañana':days[dDate.getDay()];
            let tasksHTML = `<h4>${dName} <small>(${dDate.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit'})})</small></h4><ul>`;
            let found = false;
            appData.projects.forEach(p => p.tasks.forEach(t => {
                if (t.dueDate) {
                    const tDate = new Date(t.dueDate+'T00:00:00');
                    if (tDate.toDateString() === dDate.toDateString() && t.status !== 'completed') {
                        tasksHTML += `<li class="priority-${t.priority}" title="${escapeHtml(p.name)}: ${escapeHtml(t.title)}">${escapeHtml(t.title)}</li>`;
                        found = true;
                    }
                }
            }));
            if (!found) tasksHTML += '<li><small>Sin tareas</small></li>';
            tasksHTML += '</ul>'; dDiv.innerHTML = tasksHTML; weeklyCalendarEl.appendChild(dDiv);
        }
    };

    // --- Settings Management ---
    const loadSettingsValues = () => {
        settingNameDashboardInput.value = appData.settings.sectionNames.dashboard;
        settingNameProjectsInput.value = appData.settings.sectionNames.projects;
        settingNameTodosInput.value = appData.settings.sectionNames.todos;
        settingNameEisenhowerInput.value = appData.settings.sectionNames.eisenhower;
        settingNameNotesInput.value = appData.settings.sectionNames.notes;
        colorSchemeSelector.value = appData.settings.colorScheme;
    };
    const handleSaveSectionNames = async () => { // Marked as async
        appData.settings.sectionNames.dashboard = settingNameDashboardInput.value.trim()||'Dashboard';
        appData.settings.sectionNames.projects = settingNameProjectsInput.value.trim()||'Proyectos';
        appData.settings.sectionNames.todos = settingNameTodosInput.value.trim()||'Pendientes';
        appData.settings.sectionNames.eisenhower = settingNameEisenhowerInput.value.trim()||'Matriz Eisenhower';
        appData.settings.sectionNames.notes = settingNameNotesInput.value.trim()||'Notas Rápidas';
        saveData(); updateSectionNamesUI(); await showCustomAlert('Nombres guardados.');
    };
    const handleColorSchemeChange = (e) => { appData.settings.colorScheme=e.target.value;applyColorScheme();saveData();};
    
    const exportData = () => {
        const str = JSON.stringify(appData,null,2);
        const uri = 'data:application/json;charset=utf-8,'+encodeURIComponent(str);
        const link = document.createElement('a');
        link.setAttribute('href',uri); link.setAttribute('download','primer_ajustadores_data_v3.json');
        link.click();
    };
    const importData = async (event) => { // Marked as async
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => { // Marked as async
                try {
                    const imported = JSON.parse(e.target.result);
                    if (imported && imported.settings && Array.isArray(imported.projects)) {
                        if (await showCustomConfirm('Esto reemplazará tus datos actuales. ¿Continuar?')) {
                            appData = imported;
                            appData.settings = {theme:'dark',colorScheme:'cyan-wave',sectionNames:{dashboard:'Dashboard',projects:'Proyectos',todos:'Pendientes',eisenhower:'Matriz Eisenhower',notes:'Notas Rápidas',settings:'Ajustes'},...appData.settings};
                            appData.settings.sectionNames = {dashboard:'Dashboard',projects:'Proyectos',todos:'Pendientes',eisenhower:'Matriz Eisenhower',notes:'Notas Rápidas',settings:'Ajustes',...appData.settings.sectionNames};
                            if(!appData.quickNotes)appData.quickNotes=[]; if(!appData.todos)appData.todos=[]; if(!appData.projects)appData.projects=[];
                            appData.projects.forEach(p=>p.tasks.forEach(t=>{if(t.eisenhowerQuadrant===undefined)t.eisenhowerQuadrant=null;}));
                            saveData(); initializeUI(); switchView(appData.currentView||'dashboard'); await showCustomAlert('Datos importados.');
                        }
                    } else await showCustomAlert('Archivo inválido.');
                } catch (err) { await showCustomAlert('Error al leer: '+err.message); }
                importDataInput.value = ''; 
            };
            reader.readAsText(file);
        }
    };
    const clearAllData = async () => { // Marked as async
        if (await showCustomConfirm('¡ADVERTENCIA! Borrará TODOS los datos. ¿Seguro?')) {
            localStorage.removeItem('projectAppDataPrimerAjustadores_v3');
            appData = {
                settings: {theme:'dark',colorScheme:'cyan-wave',sectionNames:{dashboard:'Dashboard',projects:'Proyectos',todos:'Pendientes',eisenhower:'Matriz Eisenhower',notes:'Notas Rápidas',settings:'Ajustes'}},
                projects: defaultProjects.map(p=>({id:generateId(),name:p.name,description:p.description,tasks:[]})),
                quickNotes:[], todos:[], currentView:'dashboard', currentProjectId:null, editingItemId:null
            };
            saveData(); initializeUI(); switchView('dashboard'); await showCustomAlert('Datos borrados. Proyectos por defecto cargados.');
        }
    };
    
    // --- Event Listeners Setup ---
    const setupEventListeners = () => {
        sidebarToggle.addEventListener('click', ()=>sidebar.classList.toggle('expanded'));
        mainContent.addEventListener('click', ()=>{if(window.innerWidth<=992 && sidebar.classList.contains('expanded')) sidebar.classList.remove('expanded');});
        navLinks.forEach(link => link.addEventListener('click', (e)=>{e.preventDefault();switchView(link.dataset.view);}));
        themeToggleBtn.addEventListener('click', ()=>{appData.settings.theme=(appData.settings.theme==='light'?'dark':'light');applyTheme();saveData();});
        
        modalCloseBtn.addEventListener('click', closeModal);
        document.getElementById('modal-cancel-btn-inner')?.addEventListener('click', closeModal);
        modalBackdrop.addEventListener('click', (e)=>{if(e.target===modalBackdrop)closeModal();});
        
        noteModalCloseBtn.addEventListener('click', closeNoteModal);
        noteModalCancelBtn.addEventListener('click', closeNoteModal);
        noteModalBackdrop.addEventListener('click', (e)=>{if(e.target===noteModalBackdrop)closeNoteModal();});
        noteModalForm.addEventListener('submit', async (e)=>{e.preventDefault();if(await handleSaveQuickNote())closeNoteModal();});
        
        addProjectBtn.addEventListener('click', openAddProjectModal);
        addTaskBtn.addEventListener('click', openAddTaskModal);
        addNoteBtn.addEventListener('click', ()=>openNoteModal());
        backToProjectsBtn.addEventListener('click', ()=>{appData.currentProjectId=null;switchView('projects');});
        
        saveSectionNamesBtn.addEventListener('click', handleSaveSectionNames);
        colorSchemeSelector.addEventListener('change', handleColorSchemeChange);
        exportDataBtn.addEventListener('click', exportData);
        importDataBtn.addEventListener('click', ()=>importDataInput.click());
        importDataInput.addEventListener('change', importData);
        clearDataBtn.addEventListener('click', clearAllData);

        addTodoItemBtn.addEventListener('click', addTodoItem);
        newTodoInput.addEventListener('keypress', (e)=>{if(e.key==='Enter')addTodoItem();});
        if(eisenhowerProjectFilter) eisenhowerProjectFilter.addEventListener('change', renderEisenhowerMatrix);

        notificationModalBackdrop.addEventListener('click', (e) => {
            if (e.target === notificationModalBackdrop) {
                notificationModalBackdrop.classList.add('hidden');
                if (confirmResolve) { confirmResolve(false); confirmResolve = null; }
            }
        });
    };
    
    function escapeHtml(unsafe) {
        if (unsafe === null || typeof unsafe === 'undefined') return '';
        return String(unsafe).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
    }

    const initializeUI = () => {
        applyTheme(); applyColorScheme(); updateSectionNamesUI(); loadSettingsValues(); 
        const initialView = appData.currentView || 'dashboard';
        switchView('placeholder'); 
        switchView(initialView); 
    };

    const initApp = () => { loadData(); setupEventListeners(); initializeUI(); };
    initApp();
});
