// TaxComp AI Tax Academy — role registry. Roles are not professional credentials.
export const agents = Object.freeze([
  { id: "TAX-01", role: "Chief Tax Officer", topics: ["tax", "compliance"] },
  { id: "TAX-02", role: "Corporate Income Tax Accountant", topics: ["company", "corporate", "income tax"] },
  { id: "TAX-03", role: "VAT Accountant", topics: ["vat", "input tax", "output tax"] },
  { id: "TAX-04", role: "EFRIS Specialist", topics: ["efris", "invoice"] },
  { id: "TAX-05", role: "PAYE Accountant", topics: ["paye", "payroll", "employment"] },
  { id: "TAX-06", role: "Withholding Tax Accountant", topics: ["withholding", "wht"] },
  { id: "TAX-07", role: "International Tax Specialist", topics: ["international", "treaty"] },
  { id: "TAX-08", role: "Transfer Pricing Specialist", topics: ["transfer pricing", "related party"] },
  { id: "TAX-09", role: "Customs and Excise Accountant", topics: ["customs", "excise"] },
  { id: "TAX-10", role: "Rental and Property Tax Accountant", topics: ["rental", "property"] },
  { id: "TAX-11", role: "SME Tax Accountant", topics: ["presumptive", "small business"] },
  { id: "TAX-12", role: "Tax Audit Specialist", topics: ["audit", "assessment"] },
  { id: "TAX-13", role: "Tax Dispute Specialist", topics: ["objection", "appeal", "dispute"] },
  { id: "TAX-14", role: "Tax Planning Specialist", topics: ["planning", "scenario"] },
  { id: "TAX-15", role: "Tax Research Specialist", topics: ["research", "law", "legislation"] },
  { id: "TAX-16", role: "Tax Compliance Manager", topics: ["deadline", "filing", "compliance"] },
  { id: "TAX-17", role: "Tax Financial Reporting Specialist", topics: ["ias 12", "deferred tax"] },
  { id: "TAX-18", role: "Tax Quality Assurance Reviewer", topics: ["review", "quality"] }
]);
export const agentById = (id) => agents.find(agent => agent.id === id);
