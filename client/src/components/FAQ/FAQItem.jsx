const FAQItem = ({ icon, question, answer }) => {
  return (
    <div className="faq-item">
      <div className="faq-question">
        <i className={icon}></i> {question}
      </div>
      <div className="faq-answer">{answer}</div>
    </div>
  );
};

export default FAQItem;
