document.addEventListener("DOMContentLoaded", function() {
    const username = "theaug1308";
    const password = "!Heheboai1";

    const loginForm = document.getElementById("login-form");
    const loginContainer = document.getElementById("login-container");
    const homeContainer = document.getElementById("home-container");
    const errorMessage = document.getElementById("error-message");
    const logoutButton = document.getElementById("logout-button");
    const toggleTaskbarButton = document.getElementById("toggle-taskbar");
    const shareButton = document.getElementById("share-button");
    const fileForm = document.getElementById("file-form");
    const fileNameInput = document.getElementById("file-name");
    const fileTypeInput = document.getElementById("file-type");
    const fileList = document.getElementById("file-list");
    const content = document.getElementById("content");
    const searchFileInput = document.getElementById("search-file");
    let codeMirrorInstances = {};
    let activeFileName = null;

    if (localStorage.getItem("loggedIn") === "true") {
        showHomePage();
    }

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const enteredUsername = document.getElementById("username").value;
        const enteredPassword = document.getElementById("password").value;

        if (enteredUsername === username && enteredPassword === password) {
            localStorage.setItem("loggedIn", "true");
            showHomePage();
        } else {
            errorMessage.textContent = "Tên người dùng hoặc mật khẩu không chính xác.";
        }
    });

    toggleTaskbarButton.addEventListener("click", function() {
        const taskbar = document.getElementById("taskbar");
        if (taskbar.classList.contains("hidden")) {
            taskbar.classList.remove("hidden");
            toggleTaskbarButton.textContent = "Hide Taskbar";
            content.classList.remove("full-width");
        } else {
            taskbar.classList.add("hidden");
            toggleTaskbarButton.textContent = "Show Taskbar";
            content.classList.add("full-width");
        }
    });

    shareButton.addEventListener("click", function() {
        if (activeFileName && codeMirrorInstances[activeFileName]) {
            const fileContent = codeMirrorInstances[activeFileName].getValue();
            createGist(activeFileName, fileContent);
        } else {
            alert("No file selected or file content is not available.");
        }
    });

    fileForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const fileName = fileNameInput.value.trim();
        const fileType = fileTypeInput.value;
        if (fileName) {
            const fullFileName = `${fileName}.${fileType}`;
            addFileToList(fullFileName);
            fileNameInput.value = '';
        }
    });

    searchFileInput.addEventListener("input", function(event) {
        const query = event.target.value.toLowerCase();
        filterFileList(query);
    });

    function addFileToList(fileName) {
        const fileContainer = document.createElement("div");
        fileContainer.style.display = "flex";
        fileContainer.style.alignItems = "center";

        const fileLink = document.createElement("a");
        fileLink.href = "#";
        fileLink.textContent = fileName;
        fileLink.style.flexGrow = "1";
        fileLink.addEventListener("click", function() {
            displayFileContent(fileName);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️";
        deleteButton.style.marginLeft = "10px";
        deleteButton.addEventListener("click", function() {
            deleteFile(fileName, fileContainer);
        });

        fileContainer.appendChild(fileLink);
        fileContainer.appendChild(deleteButton);
        fileList.appendChild(fileContainer);

        let files = JSON.parse(localStorage.getItem("files")) || [];
        if (!files.includes(fileName)) {
            files.push(fileName);
            files.sort();
            localStorage.setItem("files", JSON.stringify(files));
            renderFileList(files);
        }
    }

    function renderFileList(files) {
        fileList.innerHTML = '';
        files.forEach(function(fileName) {
            const fileContainer = document.createElement("div");
            fileContainer.style.display = "flex";
            fileContainer.style.alignItems = "center";

            const fileLink = document.createElement("a");
            fileLink.href = "#";
            fileLink.textContent = fileName;
            fileLink.style.flexGrow = "1";
            fileLink.addEventListener("click", function() {
                displayFileContent(fileName);
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑️";
            deleteButton.style.marginLeft = "10px";
            deleteButton.addEventListener("click", function() {
                deleteFile(fileName, fileContainer);
            });

            fileContainer.appendChild(fileLink);
            fileContainer.appendChild(deleteButton);
            fileList.appendChild(fileContainer);
        });
    }

    function filterFileList(query) {
        let files = JSON.parse(localStorage.getItem("files")) || [];
        files = files.filter(file => file.toLowerCase().includes(query));
        renderFileList(files);
    }

    function displayFileContent(fileName) {
        content.innerHTML = ''; 

        activeFileName = fileName;

        const fileHeader = document.createElement("h1");
        fileHeader.textContent = fileName;
        content.appendChild(fileHeader);

        const codeMirrorTextarea = document.createElement("textarea");
        content.appendChild(codeMirrorTextarea);

        const fileExtension = fileName.split('.').pop();
        const mode = fileExtension === 'py' ? 'python' : 'text/x-c++src';

        if (codeMirrorInstances[fileName]) {
            codeMirrorInstances[fileName].toTextArea();
        }

        codeMirrorInstances[fileName] = CodeMirror.fromTextArea(codeMirrorTextarea, {
            mode: mode,
            theme: "monokai",
            lineNumbers: true,
            matchBrackets: true
        });

        const savedContent = localStorage.getItem(`file_${fileName}`);
        if (savedContent) {
            codeMirrorInstances[fileName].setValue(savedContent);
        }

        codeMirrorInstances[fileName].on("change", function() {
            localStorage.setItem(`file_${fileName}`, codeMirrorInstances[fileName].getValue());
        });
    }

    function deleteFile(fileName, fileContainer) {
        fileContainer.remove();
        let files = JSON.parse(localStorage.getItem("files")) || [];
        files = files.filter(file => file !== fileName);
        localStorage.setItem("files", JSON.stringify(files));
        localStorage.removeItem(`file_${fileName}`);
        delete codeMirrorInstances[fileName];

        if (activeFileName === fileName) {
            activeFileName = null;
        }
    }

    function showHomePage() {
        loginContainer.style.display = "none";
        homeContainer.style.display = "flex";
        document.body.style.background = "white"; 

        let files = JSON.parse(localStorage.getItem("files")) || [];
        files.sort();
        renderFileList(files);
    }

    logoutButton.addEventListener("click", function() {
        localStorage.removeItem("loggedIn");
        location.reload();
    });

    function createGist(fileName, fileContent) {
        const data = {
            description: "Chia sẻ bởi Gist Manager - theaug",
            public: true,
            files: {
                [fileName]: {
                    content: fileContent
                }
            }
        };

        fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'token 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' // Thay YOUR_GITHUB_TOKEN bằng token GitHub của bạn
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            const gistUrl = data.html_url;
            if (gistUrl) {
                shortenUrl(gistUrl);
            } else {
                alert('Lỗi tạo gist. Vui lòng kiểm tra lại quyền và hạn sử dụng github token.');
            }
        })
        .catch(error => {
            console.error('Lỗi tạo gist:', error);
            alert('Không thể tạo gist, vui lòng kiểm tra lại quyền và hạn sử dụng github token');
        });
    }

    function shortenUrl(url) {
        fetch(`https://api.tinyurl.com/create?api_token=uOBJYZcZRXn8zj0eeNF4OYcJ9mNXV1p3pI8dgdtaULA00oCIXC2AJAgGEUy2`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                domain: "tinyurl.com"
            })
        })
        .then(response => response.json())
        .then(data => {
            const shortUrl = data.data.tiny_url;
            if (shortUrl) {
                copyToClipboard(shortUrl);
                alert(`Link code của bạn: ${shortUrl} (đã được lưu vào clipboard)`);
            } else {
                alert('Không thể rút gọn link, vui lòng kiểm tra lại API.');
            }
        })
        .catch(error => {
            console.error('Lỗi rút gọn link: ', error);
            alert('Không thể rút gọn link, vui lòng kiểm tra lại API.');
        });
    }

    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
});
