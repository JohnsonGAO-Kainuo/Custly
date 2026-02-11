import {
  address,
  company,
  datatype,
  internet,
  phone,
  random,
} from "faker/locale/en_US";

import { randomDate } from "./utils";
import { defaultCompanySectors } from "../../../root/defaultConfiguration";
import type { Company, RAFile } from "../../../types";
import type { Db } from "./types";

const sizes = [1, 10, 50, 250, 500];

const regex = /\W+/;

export const generateCompanies = (db: Db, size = 55): Required<Company>[] => {
  return Array.from(Array(size).keys()).map((id) => {
    const name = company.companyName();
    return {
      id,
      name: name,
      logo: {
        title: name,
        src: `./logos/${id}.png`,
      } as RAFile,
      sector: random.arrayElement(defaultCompanySectors),
      size: random.arrayElement(sizes) as 1 | 10 | 50 | 250 | 500,
      linkedin_url: `https://www.linkedin.com/company/${name
        .toLowerCase()
        .replace(regex, "_")}`,
      website: internet.url(),
      phone_number: phone.phoneNumber(),
      address: address.streetAddress(),
      zipcode: address.zipCode(),
      city: address.city(),
      stateAbbr: address.stateAbbr(),
      nb_contacts: 0,
      nb_deals: 0,
      // at least 1/3rd of companies for Jane Doe
      sales_id: datatype.number(2) === 0 ? 0 : random.arrayElement(db.sales).id,
      created_at: randomDate().toISOString(),
      description: random.arrayElement([
        "Leading provider of enterprise software solutions with a focus on digital transformation.",
        "Innovative technology company specializing in cloud infrastructure and DevOps services.",
        "Full-service digital agency offering web development, design, and marketing solutions.",
        "Global consulting firm helping businesses optimize operations and drive growth.",
        "Fast-growing startup disrupting the industry with AI-powered analytics platform.",
        "Established manufacturer with over 20 years of experience in precision engineering.",
        "Financial services company providing investment management and advisory services.",
        "Healthcare technology firm developing solutions for patient care and hospital management.",
        "E-commerce platform connecting retailers with customers across multiple channels.",
        "Telecommunications company offering networking, security, and communications services.",
      ]),
      revenue: random.arrayElement(["$1M", "$10M", "$100M", "$1B"]),
      tax_identifier: random.alphaNumeric(10),
      country: random.arrayElement(["USA", "France", "UK"]),
      context_links: [],
    };
  });
};
