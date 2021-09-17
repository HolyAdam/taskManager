import Component from './component'

export default class LoginComponent extends Component {

	constructor(id, validation) {
		super(id)

		this.validation = validation
	}

	static main = document.querySelector('main')
	static add = document.querySelector('#add')
	static header = document.querySelector('.header')

	init() {

		this.form = this.$el.querySelector('form')

	}

	onShow() {

		if (localStorage.getItem('login')) {
			this.hide()
			showElemsIfLoginIn()			

		} else {
			this.form.addEventListener('submit', loginSubmitHandler.bind(this))
		}

	}

} 

function loginSubmitHandler(e) {
	e.preventDefault()
	
	const email = this.form.elements['email'].value.trim()
	const password = this.form.elements['password'].value.trim()

	this.form.elements['email'].style.border = ''
	this.form.elements['password'].style.border = ''

	const arr = [this.validation(email), this.validation(password)]

	const isValid = arr.every((fn, i) => {
		const validInput = fn(1)
		if (!validInput) {
			if (i === 0) {
				this.form.elements['email'].style.border = '1px solid red'
			} else if (i === 1) {
				this.form.elements['password'].style.border = '1px solid red'
			}
		}
		return validInput
	})

	
	if (isValid) {

		const obj = {
			email,
			password
		}

		if (obj.email === 'test123@yandex.ru' && obj.password === '12345') {
			this.hide()
			showElemsIfLoginIn()


			localStorage.setItem('login', true) // зашли норм

		} else {

			localStorage.setItem('login', '') // зашли fail
			alert('Неправильная почта или пароль')
		
		}


	}

}


function showElemsIfLoginIn() {
	LoginComponent.main.classList.remove('hide')
	LoginComponent.add.classList.remove('hide')
	LoginComponent.header.classList.remove('hide')
}