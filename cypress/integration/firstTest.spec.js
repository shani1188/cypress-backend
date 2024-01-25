/// <reference types="cypress"/>
describe('Login the new project',()=>{

    beforeEach('login',()=>{
        cy.server()
        cy.route('GET','**/tags','fixture:tags.json')
        cy.logInToApplication()
        
    })

    it('Verify correct response and request',()=>{
        cy.server()
        cy.route('POST','**/articles').as('postArticles')
        cy.contains(' New Article ').click()
        cy.get('[placeholder="Article Title"]').type('test Article')
        cy.get('[formcontrolname="description"]').type('noting in description')
        cy.get('[formcontrolname="body"]').type('Lorem ipsum test123')
        cy.contains(' Publish Article ').click()
        cy.contains(' Delete Article ').click()
        cy.wait('@postArticles')
        cy.get('@postArticles').then( xhr =>{
            console.log(xhr)
            expect(xhr.status).to.equal(201)
            expect(xhr.request.body.article.body).to.equal('Lorem ipsum test123')
            expect(xhr.response.body.article.description).to.equal('noting in description')
        })
    })
    it('taglist',()=>{
        cy.get('.tag-list')
        .should('contain','Cypress')
        .and('contain','Testing')
        .and('contain','API')
    })

    it('verify global ',()=>{
        cy.server()
        cy.route('Get','**/articles/feed*','{"articles":[],"articlesCount":0}')
        cy.route('GET','**/articles*','fixture:articles.json')

        cy.contains('Global Feed').click()
        cy.get('app-favorite-button button').then(listOfButtons =>{
            expect(listOfButtons[0]).to.contain('1')
            expect(listOfButtons[1]).to.contain('5')
        })
        cy.fixture('articles').then(file=>{
            const articleLink = file.articles[1].slug
            cy.route('POST','**/articles/'+articleLink+'/favorite',file)
        })
        cy.get('app-favorite-button button').eq(1).click().should('contain','4')
    })

    it('Delete the article from API',()=>{
        
        const bodyRequest={
            "article":   {
                "title": "test article",
                "description": "test about ",
                "body": "description test",
                "tagList": []
            }
        }

        cy.get('@token').then(token=>{

            cy.request({
                url:Cypress.env('apiUrl')+'/api/articles/',
                headers:{'Authorization':'Token '+token},
                method: "POST",
                body:  bodyRequest
            }).then( response =>{
                expect(response.status).to.equal(201)
            })
            
            cy.contains('Global Feed').click()
            cy.wait(5000)
            cy.get('.article-preview').should('be.visible').first().click()
            cy.contains(' Delete Article ').click()

            cy.request({
                url:Cypress.env('apiUrl')+'/api/articles?limit=10&offset=0',
                headers:{'Authorization':'Token '+token},
                method:'GET'
            }).its('body').then(body=>{
                expect(body.articles[0].title).not.to.equal('test article')
            })
        })
    })
})