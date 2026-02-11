import {
  company as fakerCompany,
  internet,
  name,
  phone,
  random,
} from "faker/locale/en_US";

import {
  defaultContactGender,
  defaultNoteStatuses,
} from "../../../root/defaultConfiguration";
import type { Company, Contact } from "../../../types";
import type { Db } from "./types";
import { randomDate, weightedBoolean } from "./utils";

const maxContacts = {
  1: 1,
  10: 4,
  50: 12,
  250: 25,
  500: 50,
};

const getRandomContactDetailsType = () =>
  random.arrayElement(["Work", "Home", "Other"]) as "Work" | "Home" | "Other";

export const generateContacts = (db: Db, size = 500): Required<Contact>[] => {
  const nbAvailblePictures = 223;
  let numberOfContacts = 0;

  return Array.from(Array(size).keys()).map((id) => {
    const has_avatar =
      weightedBoolean(25) && numberOfContacts < nbAvailblePictures;
    const gender = random.arrayElement(defaultContactGender).value;
    const first_name = name.firstName(gender as any);
    const last_name = name.lastName();
    const email_jsonb = [
      {
        email: internet.email(first_name, last_name),
        type: getRandomContactDetailsType(),
      },
    ];
    const phone_jsonb = [
      {
        number: phone.phoneNumber(),
        type: getRandomContactDetailsType(),
      },
      {
        number: phone.phoneNumber(),
        type: getRandomContactDetailsType(),
      },
    ];
    const avatar = {
      src: has_avatar
        ? "https://marmelab.com/posters/avatar-" +
          (223 - numberOfContacts) +
          ".jpeg"
        : undefined,
    };
    const title = fakerCompany.bsAdjective();

    if (has_avatar) {
      numberOfContacts++;
    }

    // choose company with people left to know
    let company: Required<Company>;
    do {
      company = random.arrayElement(db.companies);
    } while (company.nb_contacts >= maxContacts[company.size]);
    company.nb_contacts++;

    const first_seen = randomDate(new Date(company.created_at)).toISOString();
    const last_seen = first_seen;

    return {
      id,
      first_name,
      last_name,
      gender,
      title: title.charAt(0).toUpperCase() + title.substr(1),
      company_id: company.id,
      company_name: company.name,
      email_jsonb,
      phone_jsonb,
      background: random.arrayElement([
        "Met at the annual tech conference. Very interested in our enterprise plan.",
        "Referred by an existing customer. Has experience with similar products.",
        "Reached out through our website contact form looking for a demo.",
        "Connected on LinkedIn. Works closely with the decision-making team.",
        "Former colleague of our sales director. Strong relationship.",
        "Attended our webinar on digital transformation strategies.",
        "Key decision maker with budget authority for software purchases.",
        "Technical lead evaluating tools for the engineering team.",
        "Inbound lead from a Google search. Comparing multiple vendors.",
        "Long-time industry contact. Has been following our company for years.",
        "Introduced by a partner company during a joint event.",
        "Responded to our email campaign about the new product launch.",
      ]),
      acquisition: random.arrayElement(["inbound", "outbound"]),
      avatar,
      first_seen: first_seen,
      last_seen: last_seen,
      has_newsletter: weightedBoolean(30),
      status: random.arrayElement(defaultNoteStatuses).value,
      tags: random
        .arrayElements(db.tags, random.arrayElement([0, 0, 0, 1, 1, 2]))
        .map((tag) => tag.id), // finalize
      sales_id: company.sales_id,
      nb_tasks: 0,
      linkedin_url: null,
    };
  });
};
