import { useEffect } from 'react';
import FAQItem from './FAQItem';

const FAQSections = () => {
  useEffect(() => {
    document.querySelectorAll('.faq-question').forEach(question => {
      question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isActive = question.classList.contains('active');

        document.querySelectorAll('.faq-answer').forEach(ans => {
          ans.style.display = 'none';
        });
        document.querySelectorAll('.faq-question').forEach(q => {
          q.classList.remove('active');
        });

        if (!isActive) {
          answer.style.display = 'block';
          question.classList.add('active');
        }
      });
    });
  }, []);

  return (
    <div className="container right-container">
      <div className="section" id="selling">
        <h3 className="section-title">SELLING</h3>
        <FAQItem 
          icon="fas fa-clock"
          question="How does the free trial work?"
          answer="Our free trial gives you full access to all selling features for 14 days."
        />
        <FAQItem 
          icon="fas fa-chart-line"
          question="What's the process of selling property?"
          answer="The process involves listing your property, scheduling viewings, and managing offers."
        />
        <FAQItem 
          icon="fas fa-calculator"
          question="How do you determine property value?"
          answer="We use market analysis, location data, and property condition to determine value."
        />
        <FAQItem 
          icon="fas fa-money-bill-wave"
          question="What fees are involved in selling?"
          answer="Standard fees include listing fees, commission, and closing costs."
        />
      </div>

      <div className="section" id="renting">
        <h3 className="section-title">RENTING</h3>
        <FAQItem 
          icon="fas fa-file-alt"
          question="What's the rental application process?"
          answer="Submit application, background check, credit check, and security deposit."
        />
        <FAQItem 
          icon="fas fa-calendar-alt"
          question="How long are typical lease terms?"
          answer="Most leases are 12 months, but we offer flexible terms from 6-24 months."
        />
        <FAQItem 
          icon="fas fa-list-ul"
          question="What's included in the rent?"
          answer="Rent typically includes property use and maintenance. Utilities vary by property."
        />
        <FAQItem 
          icon="fas fa-shield-alt"
          question="How is the security deposit handled?"
          answer="Deposits are held in escrow and returned within 30 days of move-out."
        />
      </div>

      <div className="section" id="buying">
        <h3 className="section-title">BUYING</h3>
        <FAQItem 
          icon="fas fa-tasks"
          question="What's the first step in buying?"
          answer="Get pre-approved for a mortgage and determine your budget."
        />
        <FAQItem 
          icon="fas fa-percentage"
          question="How much down payment is needed?"
          answer="Down payments typically range from 3.5% to 20% of purchase price."
        />
        <FAQItem 
          icon="fas fa-file-invoice-dollar"
          question="What closing costs should I expect?"
          answer="Closing costs usually range from 2-5% of the purchase price."
        />
        <FAQItem 
          icon="fas fa-hourglass-half"
          question="How long does buying take?"
          answer="The process typically takes 30-60 days from offer acceptance."
        />
      </div>

      <div className="section" id="payments">
        <h3 className="section-title">PAYMENTS</h3>
        <FAQItem 
          icon="fas fa-credit-card"
          question="What payment methods are accepted?"
          answer="We accept credit cards, bank transfers, and digital payments."
        />
        <FAQItem 
          icon="fas fa-calendar-check"
          question="When are payments due?"
          answer="Payments are typically due on the 1st of each month."
        />
        <FAQItem 
          icon="fas fa-exclamation-circle"
          question="Is there a late payment fee?"
          answer="Late fees apply after the 5th of each month."
        />
        <FAQItem 
          icon="fas fa-sync"
          question="How do I set up automatic payments?"
          answer="Auto-pay can be set up through your account dashboard."
        />
      </div>

      <div className="section" id="terms">
        <h3 className="section-title">TERMS & CONDITIONS</h3>
        <FAQItem 
          icon="fas fa-ban"
          question="What are the cancellation terms?"
          answer="Cancellation policies vary by service type and contract terms."
        />
        <FAQItem 
          icon="fas fa-lock"
          question="How is privacy protected?"
          answer="We follow strict data protection and privacy guidelines."
        />
        <FAQItem 
          icon="fas fa-undo"
          question="What's your refund policy?"
          answer="Refunds are processed within 30 days of approved requests."
        />
        <FAQItem 
          icon="fas fa-balance-scale"
          question="How do you handle disputes?"
          answer="Disputes are handled through our resolution center."
        />
      </div>

      <div className="section" id="account">
        <h3 className="section-title">ACCOUNT</h3>
        <FAQItem 
          icon="fas fa-user-plus"
          question="How do I create an account?"
          answer="Sign up using email or social media accounts."
        />
        <FAQItem 
          icon="fas fa-key"
          question="How do I reset my password?"
          answer="Use the 'Forgot Password' link on the login page."
        />
        <FAQItem 
          icon="fas fa-users"
          question="Can I have multiple profiles?"
          answer="One account can manage multiple property profiles."
        />
        <FAQItem 
          icon="fas fa-user-minus"
          question="How do I delete my account?"
          answer="Account deletion can be requested through settings."
        />
      </div>
    </div>
  );
};

export default FAQSections;
