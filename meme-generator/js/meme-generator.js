document.addEventListener('DOMContentLoaded', function() {
    // Enable touch scrolling on mobile devices
    document.addEventListener('touchmove', function(e) {
        // Only prevent default for elements that need drag handling
        if (!e.target.closest('.text-element')) {
            // Allow default scrolling behavior
            return true;
        }
    }, { passive: true });
    // DOM Elements
    const templateGrid = document.getElementById('template-grid');
    const memePreview = document.getElementById('meme-preview');
    const memeText = document.getElementById('meme-text');
    const textColor = document.getElementById('text-color');
    const textSize = document.getElementById('text-size');
    const textStroke = document.getElementById('text-stroke');
    const addTextBtn = document.getElementById('add-text-btn');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-btn');
    const helpBtn = document.querySelector('.help-btn');
    
    // Global variables
    let selectedTemplate = null;
    let textElements = [];
    let nextTextId = 1;
    
    // Default templates collection
    const defaultTemplates = [
        { name: 'DiCaprio Pepe', path: 'templates/DiCaprio_Pepe.jpg' },
        { name: 'Drake Pepe', path: 'templates/Drake_Pepe.jpg' },
        { name: 'Classic Pepe', path: 'templates/IMG_7661.jpeg' },
        { name: 'Most Interesting Pepe', path: 'templates/Most_Interesting_Pepe.jpg' },
        { name: 'Think About It Pepe', path: 'templates/Think_About_It_Pepe.jpg' },
        { name: 'Wonka Pepe', path: 'templates/Wonka_Pepe.jpg' }
    ];
    
    // Initialize the meme generator
    function init() {
        loadTemplates();
        setupEventListeners();
        
        // Add a help button if not present
        if (!helpBtn) {
            const helpButton = document.createElement('button');
            helpButton.className = 'help-btn';
            helpButton.innerHTML = '?';
            memePreview.appendChild(helpButton);
        }
    }
    
    // Load templates
    function loadTemplates() {
        templateGrid.innerHTML = '';
        console.log('Loading templates...');
        
        // Try to load templates from the server's JSON file
        fetch('templates/index.json')
            .then(response => {
                console.log('Template fetch response:', response.status);
                return response.json();
            })
            .then(templates => {
                console.log('Templates loaded:', templates.length);
                renderTemplates(templates);
            })
            .catch(error => {
                console.warn('Error loading templates JSON:', error);
                console.log('Using default templates instead');
                renderTemplates(defaultTemplates);
            });
    }
    
    // Render template thumbnails
    function renderTemplates(templates) {
        console.log('Rendering templates:', templates);
        if (templates.length === 0) {
            templateGrid.innerHTML = '<div class="template-placeholder">No templates available. Upload your own!</div>';
            return;
        }
        
        templates.forEach((template, index) => {
            // Create template thumbnail
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.style.backgroundImage = `url(${template.path})`;
            templateItem.dataset.path = template.path;
            templateItem.dataset.name = template.name;
            
            console.log(`Template ${index}: ${template.name}, path: ${template.path}`);
            
            // Pre-load the image to test if it works
            const testImg = new Image();
            testImg.onload = function() {
                console.log(`Template image loaded successfully: ${template.name}`);
            };
            testImg.onerror = function() {
                console.warn(`Template image failed to load: ${template.name}`);
                templateItem.classList.add('error');
                templateItem.innerHTML = '<div class="error-overlay">Image Error</div>';
            };
            testImg.src = template.path;
            
            // Handle clicks on template
            templateItem.addEventListener('click', function() {
                // Check if this template had a loading error
                if (templateItem.classList.contains('error')) {
                    alert('This template image failed to load. Please try another one.');
                    return;
                }
                
                console.log(`Selected template: ${template.name}`);
                selectTemplate(template.path, template.name);
                
                // Update active class
                document.querySelectorAll('.template-item').forEach(item => {
                    item.classList.remove('active');
                });
                templateItem.classList.add('active');
            });
            
            templateGrid.appendChild(templateItem);
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Add text button
        addTextBtn.addEventListener('click', function() {
            if (!selectedTemplate) {
                alert('Please select a template first!');
                return;
            }
            
            if (!memeText.value.trim()) {
                alert('Please enter some text!');
                return;
            }
            
            addTextToMeme();
        });
        
        // Clear button
        clearBtn.addEventListener('click', clearMeme);
        
        // Download button
        downloadBtn.addEventListener('click', downloadMeme);
        
        // Text options preview
        textColor.addEventListener('input', updateActiveText);
        textSize.addEventListener('input', updateActiveText);
        textStroke.addEventListener('change', updateActiveText);
    }
    
    // Select a template and display it
    function selectTemplate(src, name) {
        selectedTemplate = src;
        console.log('Template selected:', name, 'Source:', src);
        
        memePreview.style.backgroundImage = `url(${src})`;
        
        // Remove placeholder if it exists
        const placeholder = memePreview.querySelector('.preview-placeholder');
        if (placeholder) placeholder.remove();
        
        // Show template name
        document.querySelector('.editor-section h2').textContent = 
            name ? `Create Your "${name}" Meme` : 'Create Your Meme';
    }
    
    // Add text element to the meme
    function addTextToMeme() {
        const text = memeText.value.trim();
        const id = 'text-' + nextTextId++;
        const size = textSize.value + 'px';
        const color = textColor.value;
        const useStroke = textStroke.checked;
        
        // Create text element
        const textElement = document.createElement('div');
        textElement.id = id;
        textElement.className = 'text-element';
        textElement.innerHTML = text;
        textElement.style.fontSize = size;
        textElement.style.color = color;
        
        if (useStroke) {
            textElement.style.textShadow = '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000';
        }
        
        // Position in center initially
        textElement.style.left = '50%';
        textElement.style.top = '50%';
        textElement.style.transform = 'translate(-50%, -50%)';
        
        // Make draggable
        makeElementDraggable(textElement);
        
        // Add to DOM and tracking array
        memePreview.appendChild(textElement);
        textElements.push({
            id,
            element: textElement,
            text,
            size,
            color,
            stroke: useStroke
        });
        
        // Set as active and clear input
        setActiveTextElement(textElement);
        memeText.value = '';
    }
    
    // Make an element draggable
    function makeElementDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        element.addEventListener('mousedown', dragStart);
        element.addEventListener('touchstart', dragStart, { passive: false });
        
        // Allow double-click to edit
        element.addEventListener('dblclick', function() {
            const textObj = textElements.find(item => item.id === element.id);
            if (textObj) {
                // Load text back into editor
                memeText.value = textObj.text;
                textColor.value = textObj.color;
                textSize.value = parseInt(textObj.size);
                textStroke.checked = textObj.stroke;
                
                // Remove element
                element.remove();
                textElements = textElements.filter(item => item.id !== element.id);
            }
        });
        
        function dragStart(e) {
            e.preventDefault();
            setActiveTextElement(element);
            
            // Get cursor position
            if (e.type === 'touchstart') {
                pos3 = e.touches[0].clientX;
                pos4 = e.touches[0].clientY;
            } else {
                pos3 = e.clientX;
                pos4 = e.clientY;
            }
            
            // Add move and end listeners
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('touchmove', dragMove, { passive: false });
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchend', dragEnd);
        }
        
        function dragMove(e) {
            e.preventDefault();
            
            // Calculate new position
            if (e.type === 'touchmove') {
                pos1 = pos3 - e.touches[0].clientX;
                pos2 = pos4 - e.touches[0].clientY;
                pos3 = e.touches[0].clientX;
                pos4 = e.touches[0].clientY;
            } else {
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
            }
            
            // Remove centering transform if present
            if (element.style.transform.includes('translate(-50%, -50%)')) {
                element.style.transform = '';
                
                // Center at cursor
                const rect = element.getBoundingClientRect();
                element.style.left = (pos3 - rect.width/2) + 'px';
                element.style.top = (pos4 - rect.height/2) + 'px';
            } else {
                // Move from current position
                element.style.top = (element.offsetTop - pos2) + 'px';
                element.style.left = (element.offsetLeft - pos1) + 'px';
            }
            
            // Keep within bounds of preview area
            const previewRect = memePreview.getBoundingClientRect();
            const elemRect = element.getBoundingClientRect();
            
            if (elemRect.left < previewRect.left) element.style.left = '0px';
            if (elemRect.right > previewRect.right) element.style.left = (previewRect.width - elemRect.width) + 'px';
            if (elemRect.top < previewRect.top) element.style.top = '0px';
            if (elemRect.bottom > previewRect.bottom) element.style.top = (previewRect.height - elemRect.height) + 'px';
        }
        
        function dragEnd() {
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('touchmove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchend', dragEnd);
        }
    }
    
    // Set the active text element for editing
    function setActiveTextElement(element) {
        // Remove selected class from all elements
        document.querySelectorAll('.text-element').forEach(el => {
            el.classList.remove('selected');
        });
        
        if (element) element.classList.add('selected');
    }
    
    // Update active text element with current settings
    function updateActiveText() {
        const activeElement = document.querySelector('.text-element.selected');
        if (!activeElement) return;
        
        const size = textSize.value + 'px';
        const color = textColor.value;
        const useStroke = textStroke.checked;
        
        activeElement.style.fontSize = size;
        activeElement.style.color = color;
        
        if (useStroke) {
            activeElement.style.textShadow = '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000';
        } else {
            activeElement.style.textShadow = 'none';
        }
        
        // Update stored data
        const index = textElements.findIndex(item => item.id === activeElement.id);
        if (index !== -1) {
            textElements[index].size = size;
            textElements[index].color = color;
            textElements[index].stroke = useStroke;
        }
    }
    
    // Clear all text elements
    function clearMeme() {
        document.querySelectorAll('.text-element').forEach(el => el.remove());
        textElements = [];
        memeText.value = '';
    }
    
    // Download the meme as an image (CORS-safe alternative)
    function downloadMeme() {
        if (!selectedTemplate) {
            alert('Please select a template first!');
            return;
        }
        
        console.log('Starting download with template:', selectedTemplate);
        
        // Hide help button if present
        const helpBtn = memePreview.querySelector('.help-btn');
        if (helpBtn) helpBtn.style.display = 'none';
        
        // Create modal or container for the final meme
        const renderContainer = document.createElement('div');
        renderContainer.style.position = 'fixed';
        renderContainer.style.top = '0';
        renderContainer.style.left = '0';
        renderContainer.style.width = '100%';
        renderContainer.style.height = '100%';
        renderContainer.style.backgroundColor = 'rgba(0,0,0,0.8)';
        renderContainer.style.zIndex = '9999';
        renderContainer.style.display = 'flex';
        renderContainer.style.flexDirection = 'column';
        renderContainer.style.alignItems = 'center';
        renderContainer.style.justifyContent = 'center';
        renderContainer.style.padding = '20px';
        renderContainer.style.boxSizing = 'border-box';
        renderContainer.style.overflow = 'auto'; // Enable scrolling
        
        // Create meme display area (with exact same styling as preview)
        const memeDisplay = document.createElement('div');
        memeDisplay.style.position = 'relative';
        memeDisplay.style.width = memePreview.offsetWidth + 'px';
        memeDisplay.style.height = memePreview.offsetHeight + 'px';
        memeDisplay.style.backgroundColor = '#FFFFFF';
        memeDisplay.style.backgroundImage = memePreview.style.backgroundImage;
        memeDisplay.style.backgroundSize = 'cover';
        memeDisplay.style.backgroundPosition = 'center';
        memeDisplay.style.backgroundRepeat = 'no-repeat';
        memeDisplay.style.border = '2px solid #000';
        memeDisplay.style.margin = '0 auto 20px auto';
        
        // Create close and save buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '20px';
        buttonContainer.style.flexWrap = 'wrap';
        buttonContainer.style.justifyContent = 'center';
        
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Image (Right-Click → Save As)';
        saveButton.style.padding = '10px 20px';
        saveButton.style.backgroundColor = '#4CAF50';
        saveButton.style.color = 'white';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '5px';
        saveButton.style.cursor = 'pointer';
        saveButton.style.fontSize = '16px';
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '16px';
        
        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(closeButton);
        
        // Add instructions
        const instructions = document.createElement('p');
        instructions.textContent = 'Right-click the image above and select "Save Image As..." to download your meme';
        instructions.style.color = 'white';
        instructions.style.marginBottom = '20px';
        instructions.style.textAlign = 'center';
        
        // Clone all text elements
        document.querySelectorAll('.text-element').forEach(el => {
            const clone = el.cloneNode(true);
            // Make sure the clone is in the right position
            clone.style.position = 'absolute';
            // Compute the position percentage for proper scaling
            const rect = el.getBoundingClientRect();
            const previewRect = memePreview.getBoundingClientRect();
            
            const leftPct = ((rect.left - previewRect.left) / previewRect.width) * 100;
            const topPct = ((rect.top - previewRect.top) / previewRect.height) * 100;
            
            clone.style.left = leftPct + '%';
            clone.style.top = topPct + '%';
            clone.style.transform = '';
            
            memeDisplay.appendChild(clone);
        });
        
        // Add everything to the container
        renderContainer.appendChild(memeDisplay);
        renderContainer.appendChild(instructions);
        renderContainer.appendChild(buttonContainer);
        document.body.appendChild(renderContainer);
        
        // Handle close button
        closeButton.addEventListener('click', function() {
            document.body.removeChild(renderContainer);
            if (helpBtn) helpBtn.style.display = 'block';
        });
        
        // Handle save button instructions
        saveButton.addEventListener('click', function() {
            alert('Right-click on the image above and select "Save Image As..." to download your meme');
        });
    }
    
    // Initialize the app
    init();
});