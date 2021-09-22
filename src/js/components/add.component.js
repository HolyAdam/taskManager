import Component from './Component'
import apiService from '../services/apiService'
import SelectPure from '../library/multiselect'

export default class AddComponent extends Component {

	constructor(id) {
		super(id)
	}

	static main = document.querySelector('main')

	init() {

		const myOptions = [
		  {
		    label: "Александр",
		    value: "Alex",
		  },
		  {
		    label: "Ксюша",
		    value: "Ksu",
		  },
		  {
		    label: "Саня",
		    value: "Sanya",
		  },
		  {
		    label: "Бездарь",
		    value: "Bzdar",
		  }
		]

		this.state = {
			valid: null,
			errors: new Set(),
		}

		this.contacts = ["Alex"]

		const instance = new SelectPure("#select", {
		    options: myOptions,
		    multiple: true,
		    value: ["Alex"],
		    onChange: value => {
		    	this.contacts = []
		    	this.$el.querySelector('button').disabled = !(value.length && this.state.valid)
		    	for (const contact of value) {
		    		this.contacts.push(contact)
		    	} 
		    	console.log(this.contacts)
		    },
			classNames: {
			      select: "select-pure__select",
			      dropdownShown: "select-pure__select--opened",
			      multiselect: "select-pure__select--multiple",
			      label: "select-pure__label",
			      placeholder: "select-pure__placeholder",
			      dropdown: "select-pure__options",
			      option: "select-pure__option",
			      autocompleteInput: "select-pure__autocomplete",
			      selectedLabel: "select-pure__selected-label",
			      selectedOption: "select-pure__option--selected",
			      placeholderHidden: "select-pure__placeholder--hidden",
			      optionHidden: "select-pure__option--hidden",
			    }
		});


		this.$el.querySelector('input').addEventListener('input', addInputHandler.bind(this))
		this.$el.querySelector('input').addEventListener('focus', removeErrors.bind(this, true))

		this.$el.querySelector('form').addEventListener('submit', submitFormHandler.bind(this))	

	}

	onShow() {
		document.querySelector('.create').style.display = 'none'
	}

}



function addInputHandler(e) {

	e.preventDefault()

	
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

	e.preventDefault()

	if (this.state.valid) {

		const data = {
			value: this.state.value,
			date: new Date().toLocaleString(),
			author: localStorage.getItem('nickname'),
			tasks: 'null',
			contacts: this.contacts
		}

		this.$el.querySelector('input').value = ''
		this.$el.querySelector('button').disabled = true		



		const dataId = await apiService.postTask(data)
	
	}

}