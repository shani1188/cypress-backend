describe('logout',()=>{
    beforeEach('login',()=>{
        cy.logInToApplication()
    })
    it('Verify it logout successfully',()=>{       
        cy.wait(5000)
        cy.contains('Settings').click()
        cy.contains(' Or click here to logout. ').click()
        cy.get('.navbar-nav').should('contain','Sign up')
})
})