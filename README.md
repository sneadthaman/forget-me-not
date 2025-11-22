# **Forget Me Not – Autonomous Greeting Card App**  

## **Overview**

Forget Me Not is an autonomous greeting-card service that allows users to enter important dates for loved ones (birthdays, anniversaries, holidays, custom events). The system automatically:

1. Tracks upcoming occasions  
2. Generates personalized greeting cards (AI image + AI message or template-based)  
3. Produces print-ready PDF files  
4. Sends the card to an external print-and-mail API for fulfillment  
5. Notifies the user  
6. Bills the user automatically (or waits for approval, depending on settings)

Primary goal: **Zero-touch automation once the user enters dates.**

---

# **System Architecture**

## **Frontend**
- React / Next.js (or any modern JS framework)
- Handles:
  - User onboarding
  - Contact + occasion creation
  - Setting personal preferences
  - Card preview & optional approval workflow
  - Subscription & billing UI
  - Delivery history & tracking
- Simple canvas editor for optional manual edits

## **Backend**
- Node.js (Express or NestJS recommended)
- Responsibilities:
  - User management / auth
  - CRUD for contacts, occasions, preferences
  - Job scheduler: daily cron to identify upcoming occasions
  - Card generation pipeline
  - Integration with print/mail provider API
  - Integration with payments provider (e.g., Stripe)
  - Notifications (email, push)

## **Worker System**
- Use **BullMQ + Redis** or equivalent for job queues.
- Job types:
  - `scan_upcoming_dates`
  - `generate_text`
  - `generate_front_art`
  - `assemble_card_pdf`
  - `submit_print_job`
  - `notify_user`
  - `bill_user`

## **External Integrations**
- **AI text generator:** OpenAI or comparable API  
- **AI image generator:** OpenAI images or similar  
- **Print/mail API:**
  - Lob  
  - PostGrid  
  - Click2Mail  
  - (Any supports PDF → mail)  
- **Payment processor:** Stripe  
- **Address validation:** USPS API, Lob Validation API  
- **Email/PUSH:** SendGrid / Twilio / Firebase

---

# **User Flow**

### **1. User signs up**
- Creates profile
- Adds payment method (optional: auto-charge enabled)

### **2. User adds contacts**
- Name, relationship, address
- Occasion(s) + date
- Lead time (default: 7–10 days before event)
- Tone/style preferences (funny, sweet, religious, etc.)

### **3. Scheduler creates jobs**
Daily cron:
- Query occasions happening X days ahead (lead_time)
- Create `card_jobs` with status `pending_design`

### **4. AI generates content**
For each `card_job`:
- Pull contact + user data
- Generate:
  - Inside message (LLM)
  - Front text / phrase (short prompt)
  - Select template OR generate image

### **5. Assemble print-ready PDF**
- Merge:
  - Front cover (template or AI image)
  - Inside text (vectorized)
  - Back cover (brand mark)
- Output: 5x7 or 4x6 print-ready PDF w/ bleed

### **6. Submit to print & mail**
- Call external API with:
  - Recipient address
  - PDF file
  - Return address
- Save tracking + cost

### **7. Billing**
- If auto-send: charge card via Stripe immediately
- If approval required:
  - Notify user
  - Wait for confirmation (expire after cutoff)

### **8. User Notifications**
- “Card created”
- “Card shipped”
- “Delivery estimate: X days”

---

# **Data Model**

### **Table: users**
| field | type | notes |
|-------|------|-------|
| id | uuid | PK |
| name | string | |
| email | string | unique |
| password_hash | string | |
| auto_send_enabled | boolean | default true |
| default_lead_time_days | int | default 10 |
| default_card_tone | string | “sweet”, “funny”, etc. |
| stripe_customer_id | string | optional |

---

### **Table: contacts**
| field | type | notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK users |
| name | string | |
| relationship | string | mother, spouse, friend, etc. |
| address_line1 | string | |
| address_line2 | string | nullable |
| city | string | |
| state | string | |
| postal_code | string | |
| country | string | |
| address_validated | boolean | default false |

---

### **Table: occasions**
| field | type | notes |
|-------|------|-------|
| id | uuid | PK |
| contact_id | uuid | FK contacts |
| occasion_type | string | birthday, holiday, anniversary, custom |
| custom_label | string | nullable |
| date | date | annual repeat |
| lead_time_days | int | default from user settings |
| tone_preference | string | optional override |

---

### **Table: card_jobs**
| field | type | notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK users |
| contact_id | uuid | FK contacts |
| occasion_id | uuid | FK occasions |
| status | enum | pending_design, awaiting_approval, ready_to_print, sent_to_printer, mailed, cancelled |
| message_text | text | generated message |
| front_art_url | string | image URL |
| pdf_url | string | final print PDF |
| print_provider_id | string | tracking |
| cost_cents | int | Billing info |
| auto_send | boolean | snapshot of user preference |

---

### **Table: templates**
| field | type | notes |
|-------|------|-------|
| id | uuid | PK |
| name | string | |
| image_url | string | template asset |
| tags | json | [“birthday”, “parent”, “funny”] |
| layout_schema | json | positions for text/image |

---

### **Table: transactions**
| field | type | notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | |
| card_job_id | uuid | |
| stripe_charge_id | string | |
| amount_cents | int | |
| status | string | succeeded/failed |

---

# **Card Generation Pipeline**

## **1. Generate inside message**
Prompt parameters:
- Relationship
- Occasion
- Recipient hobbies/interests (optional user input)
- Tone
- Sender name
- Word count target

## **2. Generate front art**
Two modes:

**A. Template-based**  
Pick template by tags → inject text → rasterize into PNG or PDF.

**B. AI-generated art**  
Prompt example:
```
“5x7 inch greeting card front for a birthday, cheerful watercolor balloons, pastel palette, include text area for ‘Happy Birthday, Mom!’”
```

## **3. Assemble final PDF**
Use:
- PDFKit  
- @react-pdf/renderer  
- or Ghostscript/ImageMagick pipeline

Layers:
1. Cover (PNG or SVG)  
2. Inside left (blank)  
3. Inside right (AI-generated text)  
4. Back cover (brand info)

Output:  
- PDF  
- CMYK optional  
- 300 DPI  
- ⅛" bleed if required by the print vendor

---

# **Print/Mail Provider Integration**

Use **Lob** (example):

Endpoint:  
`POST https://api.lob.com/v1/letters`

Payload:
- `to[name]`, `to[address_line1]`, etc.
- `from[...]`
- `file` (PDF)
- `color`: true  
- `double_sided`: true

Save:
- `lob_id`
- expected delivery date

Other options:
- PostGrid API  
- EasyPost + your own mailhouse  
- Click2Mail  

---

# **Scheduling**

Use one of:
- BullMQ + Redis (recommended)
- Node-Cron for simple scanning
- Temporal.io for advanced orchestration

Daily job:
```
for each occasion:
    if date - lead_time = today:
         create card_job
```

---

# **Security & Compliance**

- Stripe PCI compliance handled via Stripe
- PII encryption for addresses
- Audit logging
