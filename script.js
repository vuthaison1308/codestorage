document.addEventListener("DOMContentLoaded", function() {
    const username = "theaug1308";
    const password = "!Heheboai1";

    const loginForm = document.getElementById("login-form");
    const loginContainer = document.getElementById("login-container");
    const homeContainer = document.getElementById("home-container");
    const errorMessage = document.getElementById("error-message");
    const logoutButton = document.getElementById("logout-button");
    const toggleTaskbarButton = document.getElementById("toggle-taskbar");
    const fileForm = document.getElementById("file-form");
    const fileNameInput = document.getElementById("file-name");
    const fileTypeInput = document.getElementById("file-type");
    const fileList = document.getElementById("file-list");
    const content = document.getElementById("content");
    const searchFileInput = document.getElementById("search-file");
    let codeMirrorInstances = {};

    // Kiểm tra trạng thái đăng nhập
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
            toggleTaskbarButton.textContent = "Ẩn Taskbar";
        } else {
            taskbar.classList.add("hidden");
            toggleTaskbarButton.textContent = "Hiện Taskbar";
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

        // Lưu file vào localStorage
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
        content.innerHTML = ''; // Xóa nội dung hiện tại

        const fileHeader = document.createElement("h1");
        fileHeader.textContent = fileName;
        content.appendChild(fileHeader);

        const codeMirrorTextarea = document.createElement("textarea");
        content.appendChild(codeMirrorTextarea);

        // Xác định chế độ của CodeMirror dựa trên phần mở rộng của file
        const fileExtension = fileName.split('.').pop();
        const mode = fileExtension === 'py' ? 'python' : 'text/x-c++src';

        // Sử dụng CodeMirror để tạo hộp nhập mã code
        if (codeMirrorInstances[fileName]) {
            codeMirrorInstances[fileName].toTextArea();
        }

        codeMirrorInstances[fileName] = CodeMirror.fromTextArea(codeMirrorTextarea, {
            mode: mode,
            theme: "monokai",
            lineNumbers: true,
            matchBrackets: true
        });

        // Hiển thị nội dung file nếu có trong localStorage
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
    }

    function showHomePage() {
        loginContainer.style.display = "none";
        homeContainer.style.display = "flex";
        document.body.style.background = "white"; // Thay đổi nền trang chủ sang màu trắng

        // Tải danh sách file từ localStorage
        let files = JSON.parse(localStorage.getItem("files")) || [];
        files.sort();
        renderFileList(files);
    }

    logoutButton.addEventListener("click", function() {
        localStorage.removeItem("loggedIn");
        location.reload();
    });
});
