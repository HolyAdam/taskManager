import Component from './component'
import apiService from '../services/apiService'
import toArray from '../utils/toArray'

export default class ProjectsComponent extends Component {

	constructor(idSelector, { loader }) {
		super(idSelector)

		this.loader = loader
	}

	static childContainer = document.querySelector('.project-items')

	async init() {

		ProjectsComponent.childContainer.addEventListener('click', clickInputHandler.bind(this))


	}

	async onShow() {

		ProjectsComponent.childContainer.classList.remove('active')
		ProjectsComponent.childContainer.innerHTML = '' // удаляем контент при onShow, дабы при необходимости онли

		document.querySelector('.create').style.display = 'block'

		this.loader.show()

		let data = await apiService.fetchTodos()

		data = toArray.giveMeArray(data)
		console.log(data)

		this.loader.hide()

		if (!data || data === 'null') {

			const p = '<p style="text-align: center">Элементов нет</p>'

			ProjectsComponent.childContainer.innerHTML = p

			return false

		}

		ProjectsComponent.childContainer.classList.add('active')

		data = data.slice(0, 40)

		this.data = data

		const html = this.data.map(render).join('')

		ProjectsComponent.childContainer.innerHTML = html

		activateTooltips()

	}

}

function render({ value, id, completed = false, author }) {

	return `
		<div class="project-item" data-id="${id}">
			<div class="tooltip" role="tooltip">${completed ? 'Выполнено' : 'В процессе'}
			<div class="arrow" data-popper-arrow></div>
			</div>
			<div class="input project-input popcorn" aria-describedby="tooltip">
				<label class="checkbox">
			        <input type="checkbox" ${completed ? 'checked' : ''}>
			        <svg viewBox="0 0 24 24" filter="url(#goo-light)">
			            <path class="tick" d="M4.5 10L10.5 16L24.5 1" />
			            <circle class="dot" cx="10.5" cy="15.5" r="1.5" />
			            <circle class="drop" cx="25" cy="-1" r="2" />
			        </svg>
			    </label>
			</div>
			<span class="project-name ${completed ? 'deleted' : ''}">${value} <a href="#">by ${ author }</a></span>
			<small class="project-users">Users: <small style="color: #36e199">${Math.floor((Math.random() * 100))}</small></small>
		</div>
	`

}


async function clickInputHandler(e) {

	const target = e.target

	const myLink = target.tagName.toLowerCase() === 'span' || target.tagName.toLowerCase() === 'a'

	if (myLink) {

		e.preventDefault()

		const dataId = target.closest('.project-item').dataset.id
		const infoAboutPost = await apiService.fetchTodo(dataId)

		const graphicHTML = renderGraphic(infoAboutPost)
		document.body.insertAdjacentHTML('beforeend', graphicHTML)

		document.querySelectorAll('#graphic').forEach((graphic, i) => {
			if (i !== 0) {
				graphic.remove()
			}
		})


		const tasksLink = document.querySelector('#tasksLink')

		// нужно обработать когда 2 окна и больше (если юзер случайно нажмет второй раз)
		if (tasksLink) {
			tasksLink.onclick = async e => {
				e.preventDefault()

				this.tasks = await apiService.getTasks()
				this.tasks = this.tasks.slice(0, 2)
				
				const underTask = renderUnderTask(this.tasks)
				document.querySelectorAll('#graphic').forEach(wind => {
					wind.classList.add('hide')
				})
				document.body.insertAdjacentHTML('beforeend', underTask)

				const dragAndDrop = () => {
					let activeCard = null
					const cards = document.querySelectorAll('.js-dragelem')
					const boxes = document.querySelectorAll('.under-wrapper')

					const dragStart = (el) => {
						setTimeout(() => {
							el.classList.add('hide')
						}, 0)
						activeCard = el
					}

					const dragEnd = (el) => {
						el.classList.remove('hide')
						activeCard = null

					}

					cards.forEach(card => {
						card.addEventListener('dragstart', () => {
							dragStart(card)
						})
						card.addEventListener('dragend', () => {
							dragEnd(card)
						})
					})

					const dragOver = (e) => {
						// console.log('over')

						e.preventDefault()
						// console.log(this)
					}

					const dragEnter = function(e) {
						e.preventDefault()
						this.classList.add('hovered')
					}

					const dragLeave = function() {
						this.classList.remove('hovered')

					}


					const dragDrop = function(e) {
						if (activeCard) {
							this.prepend(activeCard)
							this.classList.remove('hovered')
						}
					}



					boxes.forEach(box => {
						box.addEventListener('dragover', dragOver)
						box.addEventListener('dragenter', dragEnter)
						box.addEventListener('dragleave', dragLeave)
						box.addEventListener('drop', dragDrop)
					})
				}

				dragAndDrop()


				document.querySelector('.under-create').addEventListener('click', e => {

					document.querySelectorAll('.under').forEach(under => {
						under.classList.add('hide')

					})


					const underTaskForm = renderUnderTaskForm()

					document.body.insertAdjacentHTML('beforeend', underTaskForm)

					const form = document.querySelector('#undertaskform').querySelector('form')

					document.querySelector('#undertaskform').querySelector('form').addEventListener('submit', e => {
						e.preventDefault()

						const taskName = form.elements['name_task'].value.trim()
						const descr = form.elements['descr'].value.trim()

						if (!taskName || !descr) {
							alert('Неправильно задана форма')

							return
						}

						const obj = {
							title: taskName,
							body: descr
						}

						this.tasks.push(obj)

						document.querySelector('.under-wrapper').innerHTML = ''

						const newUnderTask = renderBoxingTask(this.tasks)

						console.log(this.tasks)

						document.querySelector('.under-wrapper').insertAdjacentHTML('afterbegin', newUnderTask)

						document.querySelectorAll('#undertaskform').forEach(underTask => {
							underTask.remove()
						})

						document.querySelectorAll('.under').forEach(under => {
							under.classList.remove('hide')

						})

						dragAndDrop()





					})

					document.querySelector('.undertaskform-close').addEventListener('click', e => {
						document.querySelectorAll('#undertaskform').forEach(underTask => {
							underTask.remove()
						})

						document.querySelectorAll('.under').forEach(under => {
							under.classList.remove('hide')

						})

					})


				})

				document.querySelector('.under-btn').addEventListener('click', e => {

					document.querySelectorAll('.under').forEach(under => {
						under.remove()
					})

					document.querySelectorAll('#graphic').forEach(wind => {
						wind.classList.remove('hide')
					})

				})


			}
		}
		this.hide()


		// обработка бага когда нажимаем два раза подряд очень быстро по случайности
		document.querySelectorAll('#graphicClose').forEach(close => {
			close.addEventListener('click', () => {
				document.querySelectorAll('#graphic').forEach(wind => {
					wind.remove()
				})
				this.show() // обращаемся к серверу
				// this.$el.classList.remove('hide') // можем просто убрать hide без обращения к серву
			})
		})

	}

	if (target.tagName.toLowerCase() === 'input') {
		let id = 0

		this.data = this.data.map((obj) => {
			if (target.closest('.project-item').dataset.id == obj.id) {				
				obj.completed = !obj.completed
				id = obj.id
				if (obj.completed) {
					obj.ended = new Date().toLocaleString()
				} else {
					obj.ended = null
				}
			}

			return obj
		})

		this.loader.show()

		const info = await apiService.updateTask(this.data.find(obj => obj.id === id), id)

		this.loader.hide()

		this.data = this.data.slice(0, 40)

		const html = this.data.map(render).join('')

		ProjectsComponent.childContainer.innerHTML = html

		activateTooltips()

	}
}



function activateTooltips() {
	const popcorn = document.querySelectorAll('.popcorn')
	const tooltip = document.querySelectorAll('.tooltip')

	const showEvents = ['mouseenter', 'focus'];
	const hideEvents = ['mouseleave', 'blur'];

	showEvents.forEach(event => {
		popcorn.forEach((elem, i) => {
			elem.addEventListener(event, () => {
				if (i === 0) {
					tooltip[i].style.bottom = '-20px'
					tooltip[i].style.top = 'auto'
					tooltip[i].querySelector('.arrow').style.transform = 'rotate(90deg)'
					tooltip[i].querySelector('.arrow').style.top = '-4px'
				}
				tooltip[i].style.display = 'block'
			})
		})
	})

	hideEvents.forEach(event => {
		popcorn.forEach((elem, i) => {
			elem.addEventListener(event, () => {
				tooltip[i].style.display = 'none'
			})
		})
	})
}


function renderGraphic({ completed, value, date, author, ended }) {

	return `

		<div id="graphic">
			<div class="container">
				<button id="graphicClose">
				    &times;
				</button>
				<h2 class="title">График</h2>
				<span class="ended">
					${completed ? 'Завершено' : 'Не закончено'}: <span class="pts">Начало ${date} ${ended ? `- Конец ${ended}` : ''}</span>
				</span>
				<table class="charts-css column show-labels show-data-on-hover data-spacing-20 show-primary-axis multiple stacked reverse-datasets" style="height:200px;">
					<caption>House Spending by Countries</caption> 
					<thead>
						<tr>
							<th>Country</th> 
							<th>Rent</th> 
							<th>Food</th> 
							<th>Other</th>
						</tr>
					</thead> 
					<tbody>
						<tr class="dia">
							<th style="flex-direction: row" scope="row">${value}</th> 
							<td style="--size:0.2;"><span class="data" style="opacity: 1"> 20% Кирилл </span></td>
							<td style="--size:0.2;"><span class="data" style="opacity: 1"> 20% Андрей </span></td>
							<td style="--size:0.1;"><span class="data" style="opacity: 1"> 10% Антон </span></td>
						</tr> 
						<tr class="dia">
							<th style="flex-direction: row" scope="row">${value}</th> 
							<td style="--size:0.2;"><span class="data" style="opacity: 1"> 20% Кирилл </span></td>
							<td style="--size:0.2;"><span class="data" style="opacity: 1"> 20% Андрей </span></td>
							<td style="--size:0.1;"><span class="data" style="opacity: 1"> 10% Антон </span></td>
						</tr>
						<tr class="dia">
							<th style="flex-direction: row" scope="row">${value}</th> 
							<td style="--size:0.2;"><span class="data" style="opacity: 1"> 20% Кирилл </span></td>
							<td style="--size:0.2;"><span class="data" style="opacity: 1"> 20% Андрей </span></td>
							<td style="--size:0.1;"><span class="data" style="opacity: 1"> 10% Антон </span></td>
						</tr>
					</tbody>
				</table>
				<br>
				<br>
				<p>Автор: <span><strong> ${author}</strong></span></p>
				<p>Задействованы в проекте: <span><strong>Кирилл </strong><strong>Андрей </strong><strong>Антон </strong></span></p>
				<button class="btn graphic-btn" id="tasksLink">
						
						<span>Посмотреть задачи</span>
						<svg preserveAspectRatio="none" viewBox="0 0 132 45">
						    <g clip-path="url(#clip)" filter="url(#goo-big)">
						        <circle class="top-left" cx="49.5" cy="-0.5" r="26.5" />
						        <circle class="middle-bottom" cx="70.5" cy="40.5" r="26.5" />
						        <circle class="top-right" cx="104" cy="6.5" r="27" />
						        <circle class="right-bottom" cx="123.5" cy="36.5" r="26.5" />
						        <circle class="left-bottom" cx="16.5" cy="28" r="30" />
						    </g>
						    <defs>
						        <clipPath id="clip">
						            <rect width="132" height="45" rx="7" />
						        </clipPath>
						    </defs>
						</svg>

				</button>
			</div>
		</div>

	`

}


function renderUnderTask(arr) {
	return `

		<div class="under" id="under">
			<div class="under-header">
				<div class="container-fluid">
					<div class="under-container">
						<button class="under-btn">
							<img src="img/arrow.svg" alt="Стрелка">
						</button>
						<div class="under-profile">
							<div class="under-img">
								
							</div>
							<div class="under-naming">
								<span class="under-naming__name">
									Achek Slime
								</span>
								<small class="under-naming__surname">
									Student
								</small>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="container sect">
				<h2 class="title under-title">
					Название проекта
				</h2>
					
				<div class="under-items">
					<div class="under-item under-item--notbegin">
						<h3 class="under-item__title">
							Не начаты
						</h3>
						<div class="under-wrapper">
							${arr.map(item => {
								return `
									<div class="under-box js-dragelem" draggable="true">
										<h4 class="under-item__name">
											${item.title}
										</h4>
										<p class="under-item__descr">
											${item.body}
										</p>
									</div>
								` 
							}).join('')}
						</div>
					</div>
					<div class="under-item under-item--started">
						<h3 class="under-item__title">
							В разработке
						</h3>
						<div class="under-wrapper">
							
						</div>
					</div>
					<div class="under-item under-item--ended">
						<h3 class="under-item__title">
							Завершены
						</h3>
						<div class="under-wrapper">
							
						</div>
					</div>
					<div class="under-create">
						<button class="under-create-btn underBtn" id="underBtn">
							<span>
								Add
								<small>+</small>
							</span>
						</button>
					</div>
				</div>
				
			</div>
		</div>

	`
}

function renderUnderTaskForm() {

	return `

		<div id="undertaskform">
			<div class="undertaskform-close">
				&times;
			</div>
			<form>
				<h3 class="title">Добавить таск</h3>
				<input type="text" require minlength="3" placeholder="task name" name="name_task">
				<textarea placeholder="description" name="descr"></textarea>
				<button class="btn undertaskform-btn">
						
						<span>Добавить</span>
						<svg preserveAspectRatio="none" viewBox="0 0 132 45">
						    <g clip-path="url(#clip)" filter="url(#goo-big1)">
						        <circle class="top-left" cx="49.5" cy="-0.5" r="26.5" />
						        <circle class="middle-bottom" cx="70.5" cy="40.5" r="26.5" />
						        <circle class="top-right" cx="104" cy="6.5" r="27" />
						        <circle class="right-bottom" cx="123.5" cy="36.5" r="26.5" />
						        <circle class="left-bottom" cx="16.5" cy="28" r="30" />
						    </g>
						    <defs>
						        <clipPath id="clip">
						            <rect width="132" height="45" rx="7" />
						        </clipPath>
						    </defs>
						</svg>

				</button>

			</form>
		</div>

	`

}


function renderTask(obj) {

	return `

		<div class="under-box js-dragelem" draggable="true">
			<h4 class="under-item__name">
				${obj.taskName}
			</h4>
			<p class="under-item__descr">
				${obj.descr}
			</p>
		</div>

	`

}


function renderBoxingTask(arr) {
	return `

		${arr.map(item => {
			return `
				<div class="under-box js-dragelem" draggable="true">
					<h4 class="under-item__name">
						${item.title}
					</h4>
					<p class="under-item__descr">
						${item.body}
					</p>
				</div>
			` 
		}).join('')}

	`
}