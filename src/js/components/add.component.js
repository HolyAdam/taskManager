import Component from './Component'

export default class AddComponent extends Component {

	constructor(id) {
		super(id)
	}

	static main = document.querySelector('main')

	init() {

		this.state = {
			valid: null,
			errors: new Set(),
		}

		this.$el.querySelector('input').addEventListener('input', addInputHandler.bind(this))
		this.$el.querySelector('input').addEventListener('focus', removeErrors.bind(this, true))

		this.$el.querySelector('form').addEventListener('submit', submitFormHandler.bind(this))	

	}

	onShow() {
		document.querySelector('.create').style.display = 'none'
	}

}



function addInputHandler(e) {
	const target = e.target

	this.state.value = target.value

	if (target.value.match(/[А-ЯёA-F]+/ig) && target.value.trim().length > 3) {
		this.state.valid = true
		this.state.errors = new Set()
	} else {
		this.state.valid = false
		this.state.errors.add('Больше 3 символов и буквы с цифрами')
	}

	this.$el.querySelector('button').disabled = !this.state.valid

	target.style.border = !this.state.valid ? '1px solid red' : ''


	removeErrors()

	if (this.state.errors.size) {
		for (const name of this.state.errors) {
			const div = document.createElement('div')
			div.classList.add('error')
			div.innerHTML = name
			this.$el.querySelector('input').insertAdjacentElement('afterend', div)
		}
	}

}


function removeErrors(isFocused = false) {
	document.querySelectorAll('.error').forEach(error => error.remove())
	if (isFocused)
		this.$el.querySelector('input').style.border = ''
}


async function submitFormHandler(e) {

	if (this.state.valid) {

		const data = {
			value: this.state.value
		}
	
	}

}