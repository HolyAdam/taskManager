import Component from './component'
import apiService from '../services/apiService'
import toArray from '../utils/toArray'

export default class ProjectsComponent extends Component {

	constructor(idSelector, { loader }) {
		super(idSelector)

		this.loader = loader
	}

	static childContainer = document.querySelector('.project-items')
	static colors = [
	`rgba(54, 180, 123, 0.8);`,
	`rgba(98, 250, 183, 0.8);`,
	`rgba(150, 150, 93, 0.8);`,
	`rgba(100,210,80,0.75)`,
	`rgba(90,165,255,0.75);`
	]

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

function render({ value, id, completed = false, author, contacts }) {

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
			<small class="project-users">Users: <small style="color: #36e199">${contacts.length}</small></small>
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

				const thisData = this.data

				const myEl = this.data.find(item => item.id === dataId)
				const id = myEl.id

				this.tasks = myEl.tasks

				if (this.tasks && this.tasks !== 'null') {
					this.tasks = this.tasks.slice(0, 100) // поставим ограничение okey?
				} else {
					this.tasks = []
				}
				
				const underTask = renderUnderTask(this.tasks, myEl.value)
				document.querySelectorAll('#graphic').forEach(wind => {
					wind.classList.add('hide')
				})
				document.body.insertAdjacentHTML('beforeend', underTask)

				const dragAndDrop = () => {

					const that = this

					let activeCard = null
					const cards = document.querySelectorAll('.js-dragelem')
					const boxes = document.querySelectorAll('.under-wrapper')

					// 1
					const dragStart = (el) => {
						setTimeout(() => {
							el.classList.add('hide')
							cards.forEach(card => {
								card.style.position = 'relative'
								card.style.zIndex = '-1'
							})
						}, 0)
						activeCard = el
					}

					// 5
					const dragEnd = (el) => {
						el.classList.remove('hide')
						activeCard = null

						cards.forEach(card => {
							card.style.position = ''
							card.style.zIndex = ''
						})

					}

					const clickCard = (el) => {
						const myTask = myEl.tasks.find(item => {
							return item.title === el.querySelector('h4').textContent.trim() 
							&& item.body === el.querySelector('p').textContent.trim()

						})

						document.querySelectorAll('.under').forEach(under => {
							under.classList.add('hide')

						})

						document.body.insertAdjacentHTML('beforeend', renderCalc(myTask))

						if (myTask.ended === 'start') {

							const calcForm = document.querySelector('#calc-form');

							['calcstart', 'calcend'].forEach((calcDate, i) => {
								let today = new Date();
								let dd = today.getDate();
								let mm = today.getMonth()+1;
								let yyyy = today.getFullYear();
								 if(dd<10){
								        dd='0'+dd
								    } 
								    if(mm<10){
								        mm='0'+mm
								    } 

								today = yyyy+'-'+mm+'-'+dd;
								if (i === 0) {
									document.getElementById(calcDate).setAttribute("value", today);
									document.getElementById(calcDate).setAttribute("disabled", true);
								}
								document.getElementById(calcDate).setAttribute("min", today);

							})

							calcForm.addEventListener('submit', async e => {
								e.preventDefault()

								let getTaskHours = 0

								if (myTask[localStorage.getItem('nickname')]) {
									getTaskHours = +myTask[localStorage.getItem('nickname')].calcNum
								}

								const calcStart = calcForm.elements['calc-start'].value.trim()
								const calcEnd = calcForm.elements['calc-end'].value.trim()
								const calcNum = +calcForm.elements['calc-num'].value.trim() + getTaskHours

								if (calcStart && calcEnd && calcNum) {

									const calcInfo = {
										calcStart,
										calcEnd,
										calcNum,
										name: localStorage.getItem('nickname')
									}

									myTask[localStorage.getItem('nickname')] = {
										...calcInfo
									}

									if (!myTask.hasOwnProperty('allSum')) {
										myTask['allSum'] = +calcForm.elements['calc-num'].value.trim()
									} else {
										myTask['allSum'] += +calcForm.elements['calc-num'].value.trim()

									}


									this.tasks = this.tasks.map(item => {
										if (item.title === el.querySelector('h4').textContent.trim() 
										&& item.body === el.querySelector('p').textContent.trim()) {
											item = myTask
										}

										return item
									})


									this.data.map(item => { // можно не присваивать тк возвращаем item
															// и cb сам примет новое значение
										if (item.id === id) {

											item.tasks = this.tasks

										}

										return item

									})

									document.querySelector('tbody').innerHTML = renderNewGraphicTasks(this.tasks, myEl.contacts)

									await apiService.updateTask(this.data.find(obj => obj.id === id), id)


									document.querySelectorAll('#calc').forEach(calcWindow => {
										calcWindow.remove()
									})
									document.querySelectorAll('.under').forEach(under => {
										under.classList.remove('hide')
									})


								} else {
									alert('Заполните все поля!')
								}



							})
						}

						document.querySelectorAll('#calc-close').forEach(calcClose => {
							calcClose.onclick = () => {
								document.querySelectorAll('#calc').forEach(calcWindow => {
									calcWindow.remove()
								})
								document.querySelectorAll('.under').forEach(under => {
									under.classList.remove('hide')
								})
							}
						})

					}

					cards.forEach(card => {
						card.addEventListener('dragstart', () => {
							dragStart(card)
						})
						card.addEventListener('dragend', () => {
							dragEnd(card)
						})
						card.addEventListener('click', () => {
							clickCard(card)
						})

					})



					// 3
					const dragOver = (e) => {
						// console.log('over')
						e.preventDefault()
						// console.log(this)
					}

					// 2
					const dragEnter = function(e) {
						e.preventDefault()
						this.classList.add('hovered')
					}

					const dragLeave = function() {

						this.classList.remove('hovered')


					}

					// 4
					const dragDrop = async function(e) {
						if (activeCard) {

							this.prepend(activeCard)
							this.classList.remove('hovered')

							activeCard.classList.remove('wrapper-notbegin', 'wrapper-started', 'wrapper-ended')
								
							switch (e.target.id) {

								case 'wrapper-notbegin':
									that.tasks = that.tasks.map(task => {
										if (task.title === activeCard.querySelector('h4').textContent.trim() 
											&& task.body === activeCard.querySelector('p').textContent.trim()) {

											task.ended = 'false'

										}

										return task	

									})
									activeCard.classList.add('wrapper-notbegin')
									break;


								case 'wrapper-started':
									that.tasks = that.tasks.map(task => {
										if (task.title === activeCard.querySelector('h4').textContent.trim() 
											&& task.body === activeCard.querySelector('p').textContent.trim()) {

											task.ended = 'start'

										}

										return task	

									})
									activeCard.classList.add('wrapper-started')
									break;

								case 'wrapper-ended':
									that.tasks = that.tasks.map(task => {
										if (task.title === activeCard.querySelector('h4').textContent.trim() 
											&& task.body === activeCard.querySelector('p').textContent.trim()) {

											task.ended = 'ended'

										}

										return task	
									})
									activeCard.classList.add('wrapper-ended')
									break;

							}

							thisData.map(obj => {
								if (obj.id === id) {
									obj.tasks = that.tasks
								}
								return obj
							})

							apiService.updateTask(thisData.find(obj => obj.id === id), id) // без разницы когда

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

					document.querySelector('#undertaskform').querySelector('form').addEventListener('submit', async e => {
						e.preventDefault()

						const taskName = form.elements['name_task'].value.trim()
						const descr = form.elements['descr'].value.trim()

						if (!taskName || !descr) {
							alert('Неправильно задана форма')

							return
						}

						const obj = {
							title: taskName,
							body: descr,
							ended: 'false',
							byUser: localStorage.getItem('nickname')
						}

						this.tasks.push(obj)
						this.data.map(item => {
							if (item.id === dataId) {
								item.tasks = this.tasks
							}
							return item
						})

						document.querySelector('.undertaskform-btn').disabled = true
						await apiService.updateTask(this.data.find(obj => obj.id === id), id)

						document.querySelector('.undertaskform-btn').disabled = false

						document.querySelectorAll('.under-wrapper').forEach(wrapperok => {
							wrapperok.innerHTML = ''
						})

						renderingSortTasks(this.tasks)
						console.log(this.data)

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


function renderGraphic({ completed, value, date, author, ended, contacts, tasks }) {

	const arr = []
	let max = 1

	if (tasks !== 'null') {

		tasks.forEach(item => {
			if (item.allSum) {
				arr.push(item.allSum)
			} else {
				arr.push(1)
			}
		})

		max = Math.max(...arr)
	}


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
				<table class="charts-css column show-labels show-data-on-hover data-spacing-20 show-primary-axis multiple stacked reverse-datasets" style="height:250px;">
					<tbody>
						${typeof(tasks) !== 'string' ? tasks.map(item => {
							return `
								${item['allSum'] ? `<tr class="dia">
									<th style="flex-direction: row" scope="row">${item.title} 
									</th> 
									${contacts.map((name, i) => {

										return `
												<td style="--size:${item['allSum'] ? 
												((item['allSum'] / max) * (

													item[name] ?
														item[name].calcNum / item['allSum'] :
														0

													)).toFixed(2) 
												: (1 / 6).toFixed(2)};">

													${i === 0 ? `
															<div id="dia-allhours">
																${item['allSum'] ? item['allSum'] : ' х'} ч.
															</div>
														` : ''}
													<span id="graphic-hours">

														${item[name] ? item[name].calcNum : ' '}

													</span>
													<span class="data" style="opacity: 1"> </span>
										`
									}).join('')}
								</tr>` : ''}
								
							`
						}).join('') : ''}
					</tbody>

				</table>
				<br>
				<p>Автор: <span><strong> ${author}</strong></span></p>
				<p>Задействованы в проекте (см. график): <span>${
					contacts.map((item, i) => {
						return `<span style="color: ${ProjectsComponent.colors[i]}">${item}</span>`
					}).join(', ')

				}</span></p>
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


function renderUnderTask(arr, title) {
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
									${localStorage.getItem('nickname')}
								</span>
								<small class="under-naming__surname">
									Студент
								</small>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="container sect">
				<h2 class="title under-title">
					${title}
				</h2>
					
				<div class="under-items">
					<div class="under-item under-item--notbegin">
						<h3 class="under-item__title">
							Не начаты
						</h3>
						<div class="under-wrapper" id="wrapper-notbegin">
							${arr.map(item => {
								return item.ended === 'false' ?	
								 `
									<div class="under-box js-dragelem" draggable="true">
										<h4 class="under-item__name">
											${item.title}
										</h4>
										<p class="under-item__descr">
											${item.body}
										</p>
									</div>
								` : ''
							}).join('')}
						</div>
					</div>
					<div class="under-item under-item--started">
						<h3 class="under-item__title">
							В разработке
						</h3>
						<div class="under-wrapper" id="wrapper-started">
							${arr.map(item => {
								return item.ended === 'start' ?	
								 `
									<div class="under-box js-dragelem" draggable="true">
										<h4 class="under-item__name">
											${item.title}
										</h4>
										<p class="under-item__descr">
											${item.body}
										</p>
									</div>
								` : ''
							}).join('')}
						</div>
					</div>
					<div class="under-item under-item--ended">
						<h3 class="under-item__title">
							Завершены
						</h3>
						<div class="under-wrapper" id="wrapper-ended">
							${arr.map(item => {
								return item.ended === 'ended' ?	
								 `
									<div class="under-box js-dragelem wrapper-ended" draggable="true">
										<h4 class="under-item__name">
											${item.title}
										</h4>
										<p class="under-item__descr">
											${item.body}
										</p>
									</div>
								` : ''
							}).join('')}
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
			<div class="container">
				<form>
					<h3 class="title">Добавить таск</h3>
					<input type="text" require minlength="3" placeholder="Название таска" name="name_task">
					<textarea placeholder="Описание таска" name="descr"></textarea>
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
		</div>

	`

}


function renderTask(obj, ended = false) {

	return `

		<div class="under-box js-dragelem ${ended ? 'wrapper-ended' : ''}" draggable="true">
			<h4 class="under-item__name">
				${obj.title}
			</h4>
			<p class="under-item__descr">
				${obj.body}
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


function renderingSortTasks(arr) {

	arr.forEach(item => {
		if (item.ended === 'false') {
			document.querySelector('#wrapper-notbegin')
				.insertAdjacentHTML('beforeend', renderTask(item))
		} else if (item.ended === 'start') {
			document.querySelector('#wrapper-started')
				.insertAdjacentHTML('beforeend', renderTask(item))
		} else if (item.ended === 'ended') {
			document.querySelector('#wrapper-ended')
				.insertAdjacentHTML('beforeend', renderTask(item, true))

		}
	})

}


function renderNewGraphicTasks(tasks, contacts) {

	const arr = []
		let max = 1

		if (tasks !== 'null') {

			tasks.forEach(item => {
				if (item.allSum) {
					arr.push(item.allSum)
				} else {
					arr.push(1)
				}
			})

			max = Math.max(...arr)
		}

	return `
		${typeof(tasks) !== 'string' ? tasks.map(item => {
			return `
				${item['allSum'] ? `

					<tr class="dia">
						<th style="flex-direction: row" scope="row">${item.title}</th> 
						${contacts.map((name, i) => {
							return `
									<td style="--size:${item['allSum'] ? 
									((item['allSum'] / max) * (

										item[name] ?
											item[name].calcNum / item['allSum'] :
											0

										)).toFixed(2) 
									: (1 / 6).toFixed(2)};">

										${i === 0 ? `
												<div id="dia-allhours">
													${item['allSum'] ? item['allSum'] : ' х'} ч.
												</div>
											` : ''}
										<span id="graphic-hours">

											${item[name] ? item[name].calcNum : ' '}

										</span>
										<span class="data" style="opacity: 1">  </span>
									</td>
							`
						}).join('')}
					</tr> 

				` : ''}

			`
		}).join('') : ''}

	`
}


function renderCalc({ title, body, ended, byUser = 'author' }) {

	const status = ended === 'false' ? 'Не начата' : 
		ended === 'start' ? 'В разработке' : 'Завершена'

		if (status === 'Завершена') {
			return `

				<div id="calc">
					<button id="calc-close">&times;</button>
					<div class="container">
						<h3 class="title">${title}</h3>
						<p>Автор: <span>${byUser}<span></p>
						<p>Текст задачи: <span>${body}<span></p>
						<p>Статус задачи: <span>${status}<span></p>
						<div id="calc-denied">Нельзя править уже выполненные задачи</div>

					</div>

				</div>

			`
		}

		if (status === 'Не начата') {
			return `

				<div id="calc">
					<button id="calc-close">&times;</button>
					<div class="container">
						<h3 class="title">${title}</h3>
						<p>Автор: <span>${byUser}<span></p>
						<p>Текст задачи: <span>${body}<span></p>
						<p>Статус задачи: <span>${status}<span></p>
						<div id="calc-denied">Нельзя править то, что вы не начали</div>

					</div>

				</div>

			`
		}

	return `

		<div id="calc">
			<button id="calc-close">&times;</button>
			<div class="container">
				<h3 class="title">${title}</h3>
				<p>Автор: <span>${byUser}<span></p>
				<p>Статус задачи: <span>${status}<span></p>
				<form id="calc-form">
					<div class="calc-input">
						<span>Начало</span><input type="date" name="calc-start" id="calcstart" autocomplete="off">
					</div>
					<div class="calc-input">
						<span>Конец</span><input type="date" name="calc-end" id="calcend" autocomplete="off">
					</div>
					<div class="calc-input">
						<span>Часы</span><input type="number" name="calc-num" autocomplete="off">
					</div>


					<button class="btn" id="calc-btn">
							
							<span>Списать</span>
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

				</form>

			</div>

		</div>

	`

}