let currentEditTodoId = null;
let editTodoInput = null; 

function init() {
    let infoText = document.getElementById('infoText')
    infoText.innerHTML = 'Ladataan tehtävälista palvelimelta, odota...'
    loadTodos()
    
    async function loadTodos() {
        let response = await fetch('http://localhost:3000/todos')
        let todos = await response.json()
          console.log(todos)
        showTodos(todos)
     
      }
    
      // Lisätään buttonille tapahtumankäsittelijä. Jos painetaan Edit- nappia, kusutaan SaveTodo- funktiota. 
      // Jos painetaan Add-nappia, kutsutaan addTodo-funktiota
      editTodoInput = document.getElementById('todoInput'); // Assign the correct input element
      let addEditButton = document.getElementById('addEditButton');
      addEditButton.addEventListener('click', function () {
        if (currentEditTodoId) {
          SaveTodo();
        } else {
          addTodo();
        }
      });
  }

  function createTodoListItem(todo) {
    let li = document.createElement('li')
    let li_attr = document.createAttribute('id')
    li_attr.value= todo._id
    li.setAttributeNode(li_attr)
    let text = document.createTextNode(todo.text)
    li.appendChild(text)

    // Luodaan uusi span-elementti, jonka sisällä on "Edit"-teksti
    let editSpan = document.createElement('span')
    let penIcon = document.createElement('i')
    penIcon.classList.add('space', 'fas', 'fa-pen-to-square', 'fa-xs', 'space') // Use the correct class names for the "fa-pen-to-square" icon
    editSpan.appendChild(penIcon)
    editSpan.addEventListener('click', function () {
      editTodo(todo); // Pass the todo object
    });
    li.appendChild(editSpan)

    let span = document.createElement('span')
    let span_attr = document.createAttribute('class')
    span_attr.value = 'delete'
    span.setAttributeNode(span_attr)
    let icon = document.createElement('i')
    icon.classList.add('fas', 'fa-trash', 'fa-xs') 
    span.appendChild(icon);
    span.onclick = function() { removeTodo(todo._id) }
    li.appendChild(span)
     
    return li
  }

  function showTodos(todos) {
    let todosList = document.getElementById('todosList')
    let infoText = document.getElementById('infoText')

    if (todos.length === 0) {
      infoText.innerHTML = 'Ei tehtäviä'
    } else {    
      todos.forEach(todo => {
          let li = createTodoListItem(todo)        
          todosList.appendChild(li)
      })
      infoText.innerHTML = ''
    }
  }

  async function addTodo() {
    let newTodo = todoInput;
    const data = { 'text': newTodo.value }
    const response = await fetch('http://localhost:3000/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    let todo = await response.json()
    let todosList = document.getElementById('todosList')
    let li = createTodoListItem(todo)
    todosList.appendChild(li)
  
    let infoText = document.getElementById('infoText')
    infoText.innerHTML = ''
    newTodo.value = ''
  }

  async function removeTodo(id) {
    const response = await fetch('http://localhost:3000/todos/'+id, {
      method: 'DELETE'
    })
    let responseJson = await response.json()
    let li = document.getElementById(id)
    li.parentNode.removeChild(li)
  
    let todosList = document.getElementById('todosList')
    if (!todosList.hasChildNodes()) {
      let infoText = document.getElementById('infoText')
      infoText.innerHTML = 'Ei tehtäviä'
    }
  }

  // Päivitetään teksti tietokantaan PUT- metodilla
  async function updateTodo(id, updatedText) {
    const data = { 'text': updatedText }
    const response = await fetch('http://localhost:3000/todos/'+id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      let updatedTodo = await response.json()
      return updatedTodo;
    }
    else {
      console.error('Updating todo failed')
      return null;
    }
  }

function editTodo(todo) {
  currentEditTodoId = todo._id;
  editTodoInput.value = todo.text;
  // Lisätään alkuperäinen teksti talteen, jotta se voidaan palauttaa myöhemmin
  let originalButtonText = addEditButton.textContent;
  // Muutetaan napin teksti editoitaessa
  addEditButton.textContent = 'Save'; 

  // Resetoidaan buttonin teksti ja inputin arvo
  addEditButton.removeEventListener('click', SaveTodo)
  addEditButton.addEventListener('click', function() {
    SaveTodo()
    addEditButton.textContent = originalButtonText
});
  addEditButton.style.display = 'inline';
}

// Funktio tallentaa muutokset
function SaveTodo() {
  // Tarkistetaan onko käyttäjä muokkaamassa tehtävää
  if (currentEditTodoId) {
    // Haetaan päivitetty teksti
    let updatedText = editTodoInput.value;
    // Jos tekstiä on syötetty, päivitetään ToDo
    if (updatedText) {
      updateTodo(currentEditTodoId, updatedText)
        // Jos päivitys onnistui, päivitetään teksti
        .then(updatedTodo => {
          if (updatedTodo) {
            let li = document.getElementById(currentEditTodoId);
            if (li) {
              if (li.firstChild) {
                li.firstChild.nodeValue = updatedTodo.text;
              }
            }
            // Resetoidaan buttonin teksti ja inputin arvo
            editTodoInput.value = ''
            currentEditTodoId = null
          }
        });
    }
  }
}