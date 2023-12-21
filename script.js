let csvDataArray = []; // Глобальная переменная для хранения данных из CSV файла
let selectedRowIndex = -1; // Индекс редактируемого ученика
let myChart;

function openTab(tabName) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => tab.style.display = 'none');

  if (tabName === 'statsTab') {
    displayStatsTab();
  }

  if (tabName === 'graphTab') {
    displayGraphStats(); // Вызов функции для отображения графика
  }

  document.getElementById(tabName).style.display = 'block';
  highlightTab(tabName);

  if (tabName === 'uploadTab') {
    createUploadButtons();
  }

  if (tabName === 'editTab') {
    displayExistingData();
  }

  if (tabName === 'statsTab') {
    displayStatsTab();
  }
}

function highlightTab(tabName) {
  const buttons = document.querySelectorAll('.tabButton');
  buttons.forEach(button => button.classList.remove('active'));

  const activeButton = Array.from(buttons).find(button => button.textContent.includes(tabName));
  if (activeButton) {
    activeButton.classList.add('active');
  }
}

function createUploadButtons() {
  const uploadButtonsContainer = document.getElementById('uploadButtons');

  // Создаем кнопку "Выберите файл"
  const chooseFileBtn = createButton('label', 'btn', 'Выберите файл');
  chooseFileBtn.setAttribute('for', 'fileInput');

  const fileInput = createInput('input', 'file', 'fileInput','.csv, .txt, .xls', fileSelected);
  fileInput.style.display = 'none';

  // Создаем кнопку "Загрузить файл .csv"
  const uploadFileBtn = createButton('button', 'btn', 'Загрузить файл', loadCSV);

  // Добавляем кнопки в контейнер
  uploadButtonsContainer.innerHTML = ''; // Очищаем контейнер перед добавлением новых элементов
  uploadButtonsContainer.appendChild(chooseFileBtn);
  uploadButtonsContainer.appendChild(fileInput);
  uploadButtonsContainer.appendChild(uploadFileBtn);
}

function createButton(elementType, className, textContent, clickHandler) {
  const button = document.createElement(elementType);
  button.classList.add(className);
  button.textContent = textContent;
  if (clickHandler) {
    button.addEventListener('click', clickHandler);
  }
  return button;
}


function createInput(elementType, inputType, id, accept, changeHandler) {
  const input = document.createElement(elementType);
  input.setAttribute('type', inputType);
  input.setAttribute('id', id);
  input.setAttribute('accept', accept);
  if (changeHandler) {
    input.addEventListener('change', changeHandler);
  }
  return input;
}

function fileSelected() {
  const fileInput = document.getElementById('fileInput');
  const fileName = fileInput.value.split('\\').pop();
  const chooseFileBtn = document.querySelector('#uploadButtons .btn');

  // Установка имени файла на кастомной кнопке
  chooseFileBtn.textContent = fileName || 'Выберите файл';
}

function loadCSV() {
  const fileInput = document.getElementById('fileInput');
  const csvTable = document.getElementById('csvTable');

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'xls' || fileType === 'csv'|| fileType === 'txt' ) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const csvData = e.target.result;
        csvDataArray = parseCSVData(csvData, 1); // Начинаем считывание с первой строки
        console.log(csvDataArray); // Проверка данных в консоли
        displayCSVData(csvDataArray);
        csvTable.style.display = 'table'; // Показываем таблицу после загрузки файла
      };

      reader.readAsText(file, 'UTF-8');
    } else {
      alert('Выберите файл формата .csv');
    }
  } else {
    alert('Выберите файл для загрузки');
  }
}

// Функция parseCSVData с передачей startRow
function parseCSVData(csvData, startRow) {
  const rows = csvData.split('\n');
  const dataArray = [];

  for (let i = startRow; i < rows.length; i++) {
    const columns = rows[i].split(';').map(column => column.trim());
    dataArray.push(columns);
  }

  return dataArray;
}

// Функция displayCSVData с учетом заголовков
function displayCSVData() {
  // Очищаем тело таблицы перед заполнением новыми данными
  const csvTableBody = document.getElementById('csvTableBody');
  csvTableBody.innerHTML = '';

  if (csvDataArray.length < 2) {
    // Если в массиве меньше двух строк (включая заголовок), выход
    return;
  }

  const headers = csvDataArray[0];

  // Создаем заголовок таблицы, если его еще нет
  const thead = document.getElementById('csvTableHead');
  if (!thead) {
    const trHeader = document.createElement('tr');
    trHeader.id = 'csvTableHead';

    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      trHeader.appendChild(th);
    });

    csvTableBody.appendChild(trHeader);
  }

  // Заполняем тело таблицы данными, пропуская строки с пустыми значениями
  for (let i = 0; i < csvDataArray.length; i++) {
    const columns = csvDataArray[i];

    // Исключаем пустые строки
    if (columns.length === 1 && columns[0].trim() === '') {
      continue;
    }

    const tr = document.createElement('tr');

    columns.forEach(column => {
      const td = document.createElement('td');
      td.textContent = column ? column.trim() : ''; // Проверка на существование значения
      tr.appendChild(td);
    });

    csvTableBody.appendChild(tr);
  }
}


function displayExistingData() {
  const existingDataTable = document.getElementById('existingDataTable');
  const existingDataBody = document.getElementById('existingDataBody');

  existingDataBody.innerHTML = ''; // Очищаем существующие данные в теле таблицы

  if (csvDataArray.length > 0) {
    // Заполняем тело таблицы данными, пропуская пустые строки
    csvDataArray.forEach(dataRow => {
      if (dataRow.some(value => value.trim() !== '')) {
        const tr = document.createElement('tr');

        dataRow.forEach((columnValue, columnIndex) => {
          const td = document.createElement('td');
          td.textContent = columnValue;
          tr.appendChild(td);
        });

        // Добавляем кнопку "Удалить" в последний столбец "Действия"
        const tdAction = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteButton.addEventListener('click', () => deleteStudent(tr));
        tdAction.appendChild(deleteButton);

        // Добавляем кнопку "Редактировать" в последний столбец "Действия"
        const editButton = document.createElement('button');
        editButton.textContent = 'Редактировать';
        editButton.addEventListener('click', () => editStudent(dataRow));
        tdAction.appendChild(editButton);

        tr.appendChild(tdAction);

        existingDataBody.appendChild(tr);
      }    
    });
  }
}


function editStudent(dataRow) {
  // Заполняем поля для редактирования данными выбранного ученика
  document.getElementById('studentName').value = dataRow[0] || '';
  document.getElementById('studentClass').value = dataRow[1] || '';
  document.getElementById('informaticsGrade').value = dataRow[2] || '';
  document.getElementById('physicsGrade').value = dataRow[3] || '';
  document.getElementById('mathGrade').value = dataRow[4] || '';
  document.getElementById('literatureGrade').value = dataRow[5] || '';
  document.getElementById('musicGrade').value = dataRow[6] || '';

  // Сохраняем индекс редактируемого ученика
  selectedRowIndex = csvDataArray.indexOf(dataRow);


  // Переключаем вкладку на "Создание/Редактирование журнала"
  openTab('editTab');
}

function applyChanges() {
  const studentName = document.getElementById('studentName').value.trim();
  const studentClass = document.getElementById('studentClass').value.trim();
  const informaticsGrade = document.getElementById('informaticsGrade').value.trim();
  const physicsGrade = document.getElementById('physicsGrade').value.trim();
  const mathGrade = document.getElementById('mathGrade').value.trim();
  const literatureGrade = document.getElementById('literatureGrade').value.trim();
  const musicGrade = document.getElementById('musicGrade').value.trim();

  // Проверка наличия обязательных данных
  if (!studentName || !studentClass || !informaticsGrade || !physicsGrade || !mathGrade || !literatureGrade || !musicGrade) {
    alert('Введите все обязательные данные');
    return;
  }

  // Обновляем данные выбранного ученика
  const updatedRow = [
    studentName,
    studentClass,
    informaticsGrade,
    physicsGrade,
    mathGrade,
    literatureGrade,
    musicGrade
  ];

  csvDataArray[selectedRowIndex] = updatedRow;

  // Обновляем отображение данных в таблице
  displayExistingData();
  clearInputFields();
}

function addStudent() {
  const studentName = document.getElementById('studentName').value.trim();
  const studentClass = document.getElementById('studentClass').value.trim();
  const informaticsGrade = document.getElementById('informaticsGrade').value.trim();
  const physicsGrade = document.getElementById('physicsGrade').value.trim();
  const mathGrade = document.getElementById('mathGrade').value.trim();
  const literatureGrade = document.getElementById('literatureGrade').value.trim();
  const musicGrade = document.getElementById('musicGrade').value.trim();

  // Проверка наличия обязательных данных
  if (!studentName || !studentClass || !informaticsGrade || !physicsGrade || !mathGrade || !literatureGrade || !musicGrade) {
    alert('Введите все обязательные данные');
    return;
  }

  // Проверка наличия ученика с таким же именем и классом
  const isDuplicate = csvDataArray.some(row => row[0] === studentName && row[1] === studentClass);

  if (isDuplicate) {
    alert('Ученик с таким именем и классом уже существует в таблице');
    // Очищаем поля ввода
    clearInputFields();
    return;
  }

  // Создаем новую строку для таблицы
  const tr = document.createElement('tr');
  const tdName = document.createElement('td');
  const tdClass = document.createElement('td');
  const tdInformatics = document.createElement('td');
  const tdPhysics = document.createElement('td');
  const tdMath = document.createElement('td');
  const tdLiterature = document.createElement('td');
  const tdMusic = document.createElement('td');
  const tdAction = document.createElement('td');

  // Заполняем ячейки данными
  tdName.textContent = studentName;
  tdClass.textContent = studentClass;
  tdInformatics.textContent = informaticsGrade;
  tdPhysics.textContent = physicsGrade;
  tdMath.textContent = mathGrade;
  tdLiterature.textContent = literatureGrade;
  tdMusic.textContent = musicGrade;

  // Добавляем ячейки к строке
  tr.appendChild(tdName);
  tr.appendChild(tdClass);
  tr.appendChild(tdInformatics);
  tr.appendChild(tdPhysics);
  tr.appendChild(tdMath);
  tr.appendChild(tdLiterature);
  tr.appendChild(tdMusic);
  tr.appendChild(tdAction); // Добавляем ячейку "Действия" в строку

  // Создаем кнопку "Удалить" для нового ученика
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Удалить';
  deleteButton.addEventListener('click', () => deleteStudent(tr));
  tdAction.appendChild(deleteButton);

  // Создаем кнопку "Редактировать" для нового ученика
  const editButton = document.createElement('button');
  editButton.textContent = 'Редактировать';
  editButton.addEventListener('click', () => editStudent([studentName, studentClass, informaticsGrade, physicsGrade, mathGrade, literatureGrade, musicGrade, tr]));
  tdAction.appendChild(editButton);

  // Добавляем строку к телу таблицы
  document.getElementById('existingDataBody').appendChild(tr);

  // Создаем новую строку для csvDataArray и добавляем ее
  const newStudentRow = [
    studentName,
    studentClass,
    informaticsGrade,
    physicsGrade,
    mathGrade,
    literatureGrade,
    musicGrade
  ];

  // Добавляем новую строку в глобальный массив
  csvDataArray.push(newStudentRow);

  // Очищаем поля ввода
  clearInputFields();
}

function deleteStudent(row) {
  // Получаем индекс строки
  const rowIndex = row.rowIndex;

  // Удаляем ученика из массива данных
  csvDataArray.splice(rowIndex - 1, 1);

  // Выводим значения массива в консоль
  console.log('Массив данных после удаления ученика:', csvDataArray);

  // Удаляем строку из таблицы
  row.parentNode.removeChild(row);
}

function calculateSubjectAverage() {
  const classSubjects = {};

  // Шаг 1: Считываем всех учеников из глобальной переменной
  const allStudents = csvDataArray;

  // Шаг 2: Находим все различные классы
  const uniqueClasses = [...new Set(allStudents.map(student => student[1]))];

  // Шаг 3: Соотносим классы и предметы в таблице
  uniqueClasses.forEach(className => {
    const classStudents = allStudents.filter(student => student[1] === className);

    classSubjects[className] = {
      subjects: {
        'Информатика': { total: 0, count: 0 },
        'Физика': { total: 0, count: 0 },
        'Математика': { total: 0, count: 0 },
        'Литература': { total: 0, count: 0 },
        'Музыка': { total: 0, count: 0 },
        // Добавьте другие предметы
      },
    };

    // Шаг 4: Суммируем оценки и подсчитываем количество учеников по каждому предмету
    classStudents.forEach(student => {
      for (let i = 2; i < student.length; i++) {
        const subject = Object.keys(classSubjects[className].subjects)[i - 2];
        const grade = parseInt(student[i]);

        classSubjects[className].subjects[subject].total += grade;
        classSubjects[className].subjects[subject].count += 1;
      }
    });
  });

  return classSubjects;
}

function calculateGradeCounts2() {
  const gradeCounts2 = {};

  const allStudents = csvDataArray;

  const uniqueClasses = [...new Set(allStudents.map(student => student[1]))];

  uniqueClasses.forEach(className => {
    gradeCounts2[className] = {
      'Информатика': 0,
      'Физика': 0,
      'Математика': 0,
      'Литература': 0,
      'Музыка': 0,
      // Добавьте другие предметы
    };
  });

  allStudents.forEach(student => {
    const className = student[1];

    for (let i = 2; i < student.length; i++) {
      const subject = Object.keys(gradeCounts2[className])[i - 2];
      const grade = parseInt(student[i]);

      if (grade === 2) {
        gradeCounts2[className][subject] += 1;
      }
    }
  });

  return gradeCounts2;
}

function calculateGradeCounts3() {
  const gradeCounts3 = {};

  const allStudents = csvDataArray;

  const uniqueClasses = [...new Set(allStudents.map(student => student[1]))];

  uniqueClasses.forEach(className => {
    gradeCounts3[className] = {
      'Информатика': 0,
      'Физика': 0,
      'Математика': 0,
      'Литература': 0,
      'Музыка': 0,
      // Добавьте другие предметы
    };
  });

  allStudents.forEach(student => {
    const className = student[1];

    for (let i = 2; i < student.length; i++) {
      const subject = Object.keys(gradeCounts3[className])[i - 2];
      const grade = parseInt(student[i]);

      if (grade === 3) {
        gradeCounts3[className][subject] += 1;
      }
    }
  });

  return gradeCounts3;
}

function calculateGradeCounts4() {
  const gradeCounts4 = {};

  const allStudents = csvDataArray;

  const uniqueClasses = [...new Set(allStudents.map(student => student[1]))];

  uniqueClasses.forEach(className => {
    gradeCounts4[className] = {
      'Информатика': 0,
      'Физика': 0,
      'Математика': 0,
      'Литература': 0,
      'Музыка': 0,
      // Добавьте другие предметы
    };
  });

  allStudents.forEach(student => {
    const className = student[1];

    for (let i = 2; i < student.length; i++) {
      const subject = Object.keys(gradeCounts4[className])[i - 2];
      const grade = parseInt(student[i]);

      if (grade === 4) {
        gradeCounts4[className][subject] += 1;
      }
    }
  });

  return gradeCounts4;
}

function calculateGradeCounts5() {
  const gradeCounts5 = {};

  const allStudents = csvDataArray;

  const uniqueClasses = [...new Set(allStudents.map(student => student[1]))];

  uniqueClasses.forEach(className => {
    gradeCounts5[className] = {
      'Информатика': 0,
      'Физика': 0,
      'Математика': 0,
      'Литература': 0,
      'Музыка': 0,
      // Добавьте другие предметы
    };
  });

  allStudents.forEach(student => {
    const className = student[1];

    for (let i = 2; i < student.length; i++) {
      const subject = Object.keys(gradeCounts5[className])[i - 2];
      const grade = parseInt(student[i]);

      if (grade === 5) {
        gradeCounts5[className][subject] += 1;
      }
    }
  });

  return gradeCounts5;
}

function calculatePercentage2() {
  const percentage2 = {};

  const allStudents = csvDataArray;

  const uniqueClasses = [...new Set(allStudents.map(student => student[1]))];

  uniqueClasses.forEach(className => {
    percentage2[className] = {
      'Информатика': 0,
      'Физика': 0,
      'Математика': 0,
      'Литература': 0,
      'Музыка': 0,
      // Добавьте другие предметы
    };
  });

  Object.keys(percentage2).forEach(className => {
    Object.keys(percentage2[className]).forEach(subject => {
      const totalCount = allStudents.filter(student => student[1] === className).length;
      const gradeCount2 = calculateGradeCounts2()[className][subject];

      percentage2[className][subject] = (gradeCount2 / totalCount) * 100;
    });
  });

  return percentage2;
}

function downloadTable(format) {
  let table = document.getElementById("existingDataTable");
  let fileContent = "";

  // Получить содержимое таблицы в виде значений
  for (let i = 0; i < table.rows.length; i++) {
    let rowData = table.rows[i].cells;
    let rowValues = [];

    for (let j = 0; j < rowData.length - 1; j++) {
      rowValues.push(rowData[j].innerText);
    }

    fileContent += rowValues.join(";") + "\n";
  }

  // Создать и загрузить файл в выбранном формате
  let blob, fileName, contentType;

  if (format === "csv") {
    blob = new Blob(['\ufeff' + fileContent], { type: "text/csv;charset=utf-8" });
    fileName = "table.csv";
    contentType = "text/csv;charset=utf-8";
  } else if (format === "txt") {
    blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    fileName = "table.txt";
    contentType = "text/plain;charset=utf-8";
  } else if (format === "html") {
    blob = new Blob([table.outerHTML], { type: "text/html;charset=utf-8" });
    fileName = "table.html";
    contentType = "text/html;charset=utf-8";
  } else {
    alert("Неподдерживаемый формат файла");
    return;
  }

  let url = URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  // Добавляем элемент в DOM и вызываем его click
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function chooseAndDownloadFormat() {
  let selectedFormat = prompt("Введите формат (csv, txt, html):").toLowerCase();

  if (selectedFormat === "csv" || selectedFormat === "txt" || selectedFormat === "html") {
    downloadTable(selectedFormat);
  } else {
    alert("Неподдерживаемый формат файла");
  }
}


function calculatePercentage3() {
  const percentage3 = {};

  const allStudents = csvDataArray;

  const uniqueClasses = [...new Set(allStudents.map(student => student[1]))];

  uniqueClasses.forEach(className => {
    percentage3[className] = {
      'Информатика': 0,
      'Физика': 0,
      'Математика': 0,
      'Литература': 0,
      'Музыка': 0,
      // Добавьте другие предметы
    };
  });

  Object.keys(percentage3).forEach(className => {
    Object.keys(percentage3[className]).forEach(subject => {
      const totalCount = allStudents.filter(student => student[1] === className).length;
      const gradeCount3 = calculateGradeCounts3()[className][subject];

      percentage3[className][subject] = (gradeCount3 / totalCount) * 100;
    });
  });

  return percentage3;
}

function calculatePercentage4() {
  const percentage4 = {};

  const allStudents = csvDataArray;

  const uniqueClasses = [...new Set(allStudents.map(student => student[1]))];

  uniqueClasses.forEach(className => {
    percentage4[className] = {
      'Информатика': 0,
      'Физика': 0,
      'Математика': 0,
      'Литература': 0,
      'Музыка': 0,
      // Добавьте другие предметы
    };
  });

  Object.keys(percentage4).forEach(className => {
    Object.keys(percentage4[className]).forEach(subject => {
      const totalCount = allStudents.filter(student => student[1] === className).length;
      const gradeCount4 = calculateGradeCounts4()[className][subject];

      percentage4[className][subject] = (gradeCount4 / totalCount) * 100;
    });
  });

  return percentage4;
}

function calculatePercentage5() {
  const percentage5 = {};

  const allStudents = csvDataArray;

  const uniqueClasses = [...new Set(allStudents.map(student => student[1]))];

  uniqueClasses.forEach(className => {
    percentage5[className] = {
      'Информатика': 0,
      'Физика': 0,
      'Математика': 0,
      'Литература': 0,
      'Музыка': 0,
      // Добавьте другие предметы
    };
  });

  Object.keys(percentage5).forEach(className => {
    Object.keys(percentage5[className]).forEach(subject => {
      const totalCount = allStudents.filter(student => student[1] === className).length;
      const gradeCount5 = calculateGradeCounts5()[className][subject];

      percentage5[className][subject] = (gradeCount5 / totalCount) * 100;
    });
  });

  return percentage5;
}

function displayStatsTab() {
  const statsTableBody = document.getElementById('statsTableBody');
  statsTableBody.innerHTML = '';

  const averageData = calculateSubjectAverage();
  const medianData = calculateSubjectMedian();
  const gradeCounts2Data = calculateGradeCounts2();
  const gradeCounts3Data = calculateGradeCounts3();
  const gradeCounts4Data = calculateGradeCounts4();
  const gradeCounts5Data = calculateGradeCounts5();
  const percentage2Data = calculatePercentage2();
  const percentage3Data = calculatePercentage3();
  const percentage4Data = calculatePercentage4();
  const percentage5Data = calculatePercentage5();

  Object.keys(averageData).forEach(className => {
    const classData = averageData[className];
    const medianClassData = medianData[className];
    const gradeCounts2ClassData = gradeCounts2Data[className];
    const gradeCounts3ClassData = gradeCounts3Data[className];
    const gradeCounts4ClassData = gradeCounts4Data[className];
    const gradeCounts5ClassData = gradeCounts5Data[className];
    const percentage2ClassData = percentage2Data[className];
    const percentage3ClassData = percentage3Data[className];
    const percentage4ClassData = percentage4Data[className];
    const percentage5ClassData = percentage5Data[className];

    Object.keys(classData.subjects).forEach(subject => {
      const averageDataSubject = classData.subjects[subject];
      const medianDataSubject = medianClassData.subjects[subject];
      const gradeCount2 = gradeCounts2ClassData[subject];
      const gradeCount3 = gradeCounts3ClassData[subject];
      const gradeCount4 = gradeCounts4ClassData[subject];
      const gradeCount5 = gradeCounts5ClassData[subject];
      const percent2 = percentage2ClassData[subject];
      const percent3 = percentage3ClassData[subject];
      const percent4 = percentage4ClassData[subject];
      const percent5 = percentage5ClassData[subject];

      const tr = document.createElement('tr');
      const tdClass = document.createElement('td');
      tdClass.textContent = className;

      const tdSubject = document.createElement('td');
      tdSubject.textContent = subject;

      const tdAverageGrade = document.createElement('td');
      tdAverageGrade.textContent = averageDataSubject.count > 0 ? (averageDataSubject.total / averageDataSubject.count).toFixed(2) : 'N/A';

      const tdMedianGrade = document.createElement('td');
      tdMedianGrade.textContent = medianDataSubject ? calculateMedian(medianDataSubject.grades).toFixed(2) : 'N/A';

      const tdGradeCount2 = document.createElement('td');
      tdGradeCount2.textContent = gradeCount2 || '0';

      const tdGradeCount3 = document.createElement('td');
      tdGradeCount3.textContent = gradeCount3 || '0';

      const tdGradeCount4 = document.createElement('td');
      tdGradeCount4.textContent = gradeCount4 || '0';

      const tdGradeCount5 = document.createElement('td');
      tdGradeCount5.textContent = gradeCount5 || '0';

      const tdPercent2 = document.createElement('td');
      tdPercent2.textContent = percent2 ? percent2.toFixed(2) + '%' : '0 %';

      const tdPercent3 = document.createElement('td');
      tdPercent3.textContent = percent3 ? percent3.toFixed(2) + '%' : '0 %';

      const tdPercent4 = document.createElement('td');
      tdPercent4.textContent = percent4 ? percent4.toFixed(2) + '%' : '0 %';

      const tdPercent5 = document.createElement('td');
      tdPercent5.textContent = percent5 ? percent5.toFixed(2) + '%' : '0 %';

      tr.appendChild(tdClass);
      tr.appendChild(tdSubject);
      tr.appendChild(tdAverageGrade);
      tr.appendChild(tdMedianGrade);
      tr.appendChild(tdGradeCount2);
      tr.appendChild(tdGradeCount3);
      tr.appendChild(tdGradeCount4);
      tr.appendChild(tdGradeCount5);
      tr.appendChild(tdPercent2);
      tr.appendChild(tdPercent3);
      tr.appendChild(tdPercent4);
      tr.appendChild(tdPercent5);

      statsTableBody.appendChild(tr);
    });
  });
}

function calculateMedian(csvDataArray) {
  const sortedArray = csvDataArray.slice().sort((a, b) => a - b);
  const length = sortedArray.length;

  if (length % 2 === 0) {
    // Если массив четной длины, медиана - среднее двух средних элементов
    const middle1 = sortedArray[length / 2 - 1];
    const middle2 = sortedArray[length / 2];
    return (middle1 + middle2) / 2;
  } else {
    // Если массив нечетной длины, медиана - средний элемент
    return sortedArray[Math.floor(length / 2)];
  }
}

function calculateSubjectMedian() {
  const classSubjects = {};

  // Шаг 1: Считываем всех учеников из глобальной переменной
  const allStudents = csvDataArray;

  // Шаг 2: Находим все различные классы
  const uniqueClasses = [...new Set(allStudents.map(student => student[1]))];

  // Шаг 3: Соотносим классы и предметы в таблице
  uniqueClasses.forEach(className => {
    const classStudents = allStudents.filter(student => student[1] === className);

    classSubjects[className] = {
      subjects: {
        'Информатика': { grades: [] },
        'Физика': { grades: [] },
        'Математика': { grades: [] },
        'Литература': { grades: [] },
        'Музыка': { grades: [] },
        // Добавьте другие предметы
      },
    };

    // Шаг 4: Собираем оценки каждого предмета
    classStudents.forEach(student => {
      for (let i = 2; i < student.length; i++) {
        const subject = Object.keys(classSubjects[className].subjects)[i - 2];
        const grade = parseInt(student[i]);

        classSubjects[className].subjects[subject].grades.push(grade);
      }
    });
  });

  return classSubjects;
}

function clearInputFields() {
  const inputFields = document.querySelectorAll('input');
  inputFields.forEach(input => {
    input.value = '';
  });
}

function parseTableDataForGraph() {
  const averageData = calculateSubjectAverage();
  const medianData = calculateSubjectMedian();
  const gradeCounts2Data = calculateGradeCounts2();
  const gradeCounts3Data = calculateGradeCounts3();
  const gradeCounts4Data = calculateGradeCounts4();
  const gradeCounts5Data = calculateGradeCounts5();
  const percentage2Data = calculatePercentage2();
  const percentage3Data = calculatePercentage3();
  const percentage4Data = calculatePercentage4();
  const percentage5Data = calculatePercentage5();

  const data = {
    labels: [], // Массив для названий предметов
    datasets: [
      {
        label: 'Средняя оценка',
        data: [], // Массив для средних оценок
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        borderColor: 'rgba(255, 0, 0, 1)',
        borderWidth: 1,
      },
      {
        label: 'Медиана',
        data: [], // Массив для медиан
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        borderColor: 'rgba(0, 255, 0, 1)',
        borderWidth: 1,
      },
      {
        label: 'Кол-во учеников с оценкой 2',
        data: [], // Массив для данных по количеству учеников с оценкой 2
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Кол-во учеников с оценкой 3',
        data: [], // Массив для данных по количеству учеников с оценкой 3
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Кол-во учеников с оценкой 4',
        data: [], // Массив для данных по количеству учеников с оценкой 4
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
      {
        label: 'Кол-во учеников с оценкой 5',
        data: [], // Массив для данных по количеству учеников с оценкой 5
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: '% учеников с оценкой 2',
        data: [], // Массив для данных по проценту оценки 2
        backgroundColor: 'rgba(128, 0, 128, 0.2)',
        borderColor: 'rgba(128, 0, 128, 1)',
        borderWidth: 1,
      },
      {
        label: '% учеников с оценкой 3',
        data: [], // Массив для данных по проценту оценки 3
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        borderColor: 'rgba(0, 0, 255, 1)',
        borderWidth: 1,
      },
      {
        label: '% учеников с оценкой 4',
        data: [], // Массив для данных по проценту оценки 4
        backgroundColor: 'rgba(0, 128, 0, 0.2)',
        borderColor: 'rgba(0, 128, 0, 1)',
        borderWidth: 1,
      },
      {
        label: '% учеников с оценкой 5',
        data: [], // Массив для данных по проценту оценки 5
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
        borderColor: 'rgba(255, 165, 0, 1)',
        borderWidth: 1,
      },
    ],
  };

  Object.keys(averageData).forEach((className) => {
    const classData = averageData[className];
    Object.keys(classData.subjects).forEach((subject) => {
      const label = `${className} - ${subject}`;
      const data2 = gradeCounts2Data[className][subject] || 0;
      const data3 = gradeCounts3Data[className][subject] || 0;
      const data4 = gradeCounts4Data[className][subject] || 0;
      const data5 = gradeCounts5Data[className][subject] || 0;
      const average = classData.subjects[subject].count > 0
        ? (classData.subjects[subject].total / classData.subjects[subject].count).toFixed(2)
        : 'N/A';
      const median = medianData[className].subjects[subject]
        ? calculateMedian(medianData[className].subjects[subject].grades).toFixed(2)
        : 'N/A';
      const percent2 = percentage2Data[className][subject] || 0;
      const percent3 = percentage3Data[className][subject] || 0;
      const percent4 = percentage4Data[className][subject] || 0;
      const percent5 = percentage5Data[className][subject] || 0;

      console.log(label, average, median, data2, data3, data4, data5, percent2, percent3, percent4, percent5);

      data.labels.push(label);
      data.datasets[0].data.push(average);
      data.datasets[1].data.push(median);
      data.datasets[2].data.push(data2);
      data.datasets[3].data.push(data3);
      data.datasets[4].data.push(data4);
      data.datasets[5].data.push(data5);
      data.datasets[6].data.push(percent2);
      data.datasets[7].data.push(percent3);
      data.datasets[8].data.push(percent4);
      data.datasets[9].data.push(percent5);
    });
  });

  console.log(data);

  return data;
}



// Определение функции для отображения статистики в графическом виде
function displayGraphStats() {
  // Получаем контейнер для графика
  const graphContainer = document.getElementById('graphTab');

  // Создаем элемент canvas для размещения графика
  const canvas = document.createElement('canvas');
  canvas.id = 'myChart';
  graphContainer.appendChild(canvas);

  // Получаем контекст canvas
  const ctx = canvas.getContext('2d');

  // Получаем данные из таблицы статистики
  const data = parseTableDataForGraph();
  // Определяем опции для графика
  const options = {
    scales: {
      
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
        },
        ticks: {
          font: {
            size: 20, // Устанавливаем размер шрифта для меток на оси y
          },
        },
      },
      x: {
        title: {
          display: true,
        },
        ticks: {
          font: {
            size: 20, // Устанавливаем размер шрифта для меток на оси x
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            var label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y + '%';
            return label;
          },
          title: function (context) {
            return context[0].label;
          },
        },
        title: {
          font: {
            size: 40, // Размер шрифта для заголовка во всплывающем окне
          },
          display: true,
        },
        body: {
          font: {
            size: 36, // Размер шрифта для текста во всплывающем окне
          },
          display: true,
        },
      },
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14, // Размер шрифта для легенды
          },
        },
      },
    },

    defaultFontSize: 16, // Размер шрифта по умолчанию
  };

  // Добавим небольшую задержку перед созданием графика
  setTimeout(() => {
    // Если график уже существует, обновляем его данные
    if (myChart) {
      myChart.data = data;
      myChart.options = options;
      myChart.update();
    } else {
      // Создаем график, если он еще не существует
      myChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options,
      });
    }
  }, 100);
}
