import Component from './Component'
import apiService from '../services/apiService'
import SelectPure from '../library/multiselect'


export default class AddComponent extends Component {

	constructor(id) {
		super(id)
	}

	static main = document.querySelector('main')

	init() {


		let myOptions = [
		{
		  label: "achek_slime",
		  value: "achek_slime",
		},
		  {
		    label: "adam",
		    value: "adam",
		  },
		  {
		    label: "misha1337",
		    value: "misha1337",
		  },
		  {
		    label: "maksemenovv",
		    value: "maksemenovv",
		  }
		]

		this.state = {
			valid: null,
			errors: new Set(),
			value: ''
		}


		/*
			const myData = Object.values(data).map(contact => {
				return {
					label: contact.nick,
					value: contact.nick
				}
			})
		*/

		// p.s sadge что нет метода который бы обновлял данные у селекта - cringe


		if (localStorage.getItem('nickname')) {

			fetchContacts.call(this, 'https://taskmanager412-default-rtdb.firebaseio.com/contacts.json',
				myOptions)

			
		}

		document.addEventListener('loadForLogin', e => {

			fetchContacts.call(this, 'https://taskmanager412-default-rtdb.firebaseio.com/contacts.json',
				myOptions)


		})


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

	if (target.value.match(/[А-ЯёA-Z]+/ig) && target.value.trim().length > 3 && this.contacts.length) {
		this.state.valid = true
		this.state.errors = new Set()
	} else {
		this.state.valid = false
		this.state.errors.add('Больше 3 символов и буквы с цифрами и c контактами')
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

		if (!this.contacts.includes(localStorage.getItem('nickname'))) {
			this.contacts.push(localStorage.getItem('nickname'))
		} 

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


function initSelectWithDynamicData(data, arr) {


	data = data || {}

	const myData = Object.values(data).map(contact => {
		return {
			label: contact.nick,
			value: contact.nick
		}
	})

	arr.push(...myData)

	arr = arr.filter(item => {
		return item.value !== localStorage.getItem('nickname')
	})

	this.contacts = [arr[0].value]

	const instance = new SelectPure("#select", {
	    options: arr,
	    multiple: true,
	    value: [arr[0].value],
	    onChange: value => {
	    	this.contacts = []
	    	this.$el.querySelector('button').disabled = !(value.length && this.state.valid)
	    	if (value.length && this.state.value.match(/[А-ЯёA-F]+/ig) && 
	    		this.state.value.trim().length > 3) {
	    		document.querySelectorAll('.error').forEach(error => error.remove())	

	    		document.querySelector('.add .add__input').style.border = ''
	    		this.$el.querySelector('button').disabled = false
	    		this.state.valid = true
	    		this.state.errors = new Set()

	    	}
	    	for (const contact of value) {
	    		this.contacts.push(contact)
	    	} 
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


}



function fetchContacts(url, myOptions) {
	return fetch(url)
				.then(response => response.json())
				.then(data => initSelectWithDynamicData.call(this, data, myOptions))
				
}
