const App = {
	template: `
  	<div class="container mt-4">
  		<div class="d-flex justify-content-between mb-4">
				<h1>Companies</h1>
				<button class="btn btn-primary" @click="addNewCompany">Add new Company</button>
			</div>
			<div v-if="!companiesData" class="d-flex justify-content-center">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
			</div>
    	<table class="table" v-else>
				<thead>
					<tr>
						<th scope="col">#</th>
						<th scope="col">Country ISO 3</th>
						<th scope="col">Vat</th>
						<th scope="col">Name</th>
						<th scope="col">Description</th>
						<th scope="col">Website</th>
						<th scope="col">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(company, index) in companiesData.data" :key="company.ID">
						<th scope="row">{{index + 1}}</th>
						<td>{{company.CountryIso3}}</td>
						<td>{{company.Vat}}</td>
						<td>{{company.Name}}</td>
						<td>{{company.Description}}</td>
						<td><a :href="'https://' + company.Website" target="_blank">{{company.Website}}</a></td>
						<td><button class="btn btn-primary" @click="editCompany(company.ID)">Edit</button></td>
					</tr>
				</tbody>
			</table>
			<v-dialog v-if="isDialogOpen" @close="isDialogOpen = false" :company-id="editCompanyId" @save="getCompanies"/>
    </div>
  `,
	data() {
		return {
			companiesData: null,
			isDialogOpen: false,
			editCompanyId: null
		}
	},
	methods: {
		addNewCompany() {
			this.editCompanyId = null;
			this.isDialogOpen = true;
		},
		editCompany(id) {
			this.editCompanyId = id;
			this.isDialogOpen = true;
		},
		getCompanies() {
			fetch("https://api-test.evoctrl.com/v1/accounting/companies")
				.then(response => response.text())
				.then(result => {
					this.companiesData = JSON.parse(result)
				})
				.catch(error => console.log('error', error));
		}
	},
	created() {
		this.getCompanies();
	}
};

const app = Vue.createApp(App);

const initalCompany = {
	name: "",
	description: "",
	website: "",
	country_iso3: "",
	vat: "",
	ein: ""
}

app.component("v-dialog", {
	template: `
  	<div class="modal" tabindex="-1" style="display: block">
			<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
				<div v-if="!companyObject" class="d-flex justify-content-center">
					<div class="spinner-border text-primary" role="status">
						<span class="visually-hidden">Loading...</span>
					</div>
				</div>
				<div class="modal-content" v-else>
					<div class="modal-header">
						<h5 class="modal-title">Modal title</h5>
						<button type="button" class="btn-close" @click="closeDialog"></button>
					</div>
					<div class="modal-body">
						<div class="mb-3">
							<label for="countryIso3" class="form-label">Country ISO 3</label>
							<input type="text" class="form-control" id="countryIso3" v-model="companyObject.country_iso3" maxlength="3">
						</div>
						<div class="mb-3">
							<label for="vat" class="form-label">VAT</label>
							<input type="text" class="form-control" id="vat" v-model="companyObject.vat">
						</div>
						<div class="mb-3">
							<label for="ein" class="form-label">EIN</label>
							<input type="text" class="form-control" id="ein" v-model="companyObject.ein">
						</div>
						<div class="mb-3">
							<label for="companyName" class="form-label">Company name</label>
							<input type="text" class="form-control" id="companyName" v-model="companyObject.name">
						</div>
						<div class="mb-3">
							<label for="companyDescription" class="form-label">Company description</label>
							<input type="text" class="form-control" id="companyDescription" v-model="companyObject.description">
						</div>
						<div class="mb-3">
							<label for="companyWebsite" class="form-label">Company website</label>
							<input type="text" class="form-control" id="companyWebsite" v-model="companyObject.website">
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="closeDialog">Close</button>
						<button type="button" class="btn btn-primary" @click="save">Save changes</button>
					</div>
				</div>
			</div>
		</div>
  `,
	props: {
		companyId: {
			type: String,
		}
	},
	data() {
		return {
			companyObject: null
		}
	},
	methods: {
		generateNewId() {
			return `f${(+new Date).toString(16)}`
		},
		closeDialog() {
			this.$emit("close");
		},
		createCompany() {
			fetch("https://api-test.evoctrl.com/v1/accounting/company", {
				method: 'POST',
				body: JSON.stringify({...this.companyObject, uuid: this.generateNewId()})
			})
				.then(response => response.text())
				.then(() => {
					this.closeDialog();
					this.$emit("save");
				})
				.catch(error => console.log('error', error));
		},
		updateCompany() {
			const { name, description, website, country_iso3, vat, ein } = this.companyObject;
			const body = JSON.stringify({ name, description, website, country_iso3, vat, ein });
			fetch(`https://api-test.evoctrl.com/v1/accounting/company/${this.companyId}`, {
				method: 'PUT',
				body
			})
				.then(response => response.text())
				.then(() => {
					this.closeDialog();
					this.$emit("save");
				})
				.catch(error => console.log('error', error));
		},
		save() {
			this.companyId ? this.updateCompany() : this.createCompany();
		},
		getCompany() {
			fetch(`https://api-test.evoctrl.com/v1/accounting/company/${this.companyId}`)
				.then(response => response.text())
				.then(result => {
					this.companyObject = {...JSON.parse(result).data};
				})
				.catch(error => console.log('error', error));
		}
	},
	created() {
		if (this.companyId) {
			this.getCompany();
		} else {
			this.companyObject = {...initalCompany};
		}
	},
});

app.mount("#app");
