# Firestore Security Specification & Threat Model

This specification defines the security invariants and threat model for **The Vagina Room**'s Firestore implementation.

---

## 1. Data Invariants & Access Matrix

| Collection | Create Rule / Schema Requirement | Read Rule / Constraint | Update / Delete Constraint |
|:---|:---|:---|:---|
| `/users/{userId}` | Unauthenticated creation allowed if registering. Must set matching `uid`. Must default roles to `member`. | Authenticated as owner (`request.auth.uid == userId`) or admin. No blanket list. | Admins can update all fields. Owners cannot update sensitive RBAC fields (`isAdmin`, `isMember`, `role`, etc.). |
| `/admins/{uid}` | Only admins. | Authenticated users can read. | Only admins can write/delete. |
| `/configs/{configId}` | Only admins. | Publicly readable. | Only admins can write/delete. |
| `/content/{document=**}` | Only admins. | Publicly readable. | Only admins can write/delete. |
| `/blogs/{blogId}` | Only admins. | Publicly readable. | Only admins can write/delete. |
| `/pages/{pageId}` | Only admins. | Publicly readable. | Only admins can write/delete. |
| `/media/{mediaId}` | Only admins. | Publicly readable. | Only admins can write/delete. |
| `/orders/{orderId}` | Authenticated users. `userId` in document must match authenticated `uid`. | Owner (`resource.data.userId == request.auth.uid`) or admin. | Only admins. |
| `/submissions/{subId}` | Public create allowed (landing page forms). | Only admins can read. | Only admins can update/delete. |
| `/wellnessReflections/{id}` | Authenticated owners only. `userId` must match `request.auth.uid`. | Owner or admin. | Owner or admin. |
| `/wellnessGoals/{id}` | Authenticated owners only. `userId` must match `request.auth.uid`. | Owner or admin. | Owner can update non-immutable fields. |
| `/direct_messages/{id}` | Authenticated users. `senderId` must match `uid`. | Sender or recipient only. | Recipient can update status/read state. Admin can delete. |
| `/community_threads/{id}` | Authenticated users. `authorId` must match `uid`. | Authenticated users. | Owner can edit/delete. Admin can edit/delete. |
| `/stats/{id}` | Standard ID incrementor. Anyone can increment. | Anyone can get, list is blocked. | Strict schema constraint on update: only `lastCount` is incrementable. |
| `/discountCodes/{id}` | Only admins. | Public read allowed to validate checkout discounts. | Only admins. |
| `/exclusiveContent/{id}` | Only admins. | Active premium members/admins only. | Only admins. |
| `/resource_library/{id}` | Only admins. | Active premium members/admins only. | Only admins. |
| `/events/{id}` | Only admins. | Publicly readable. | Only admins. |
| `/payout_history/{id}` | Authenticated users can request payout. Document `userId` must match `uid`. | Owner or admin. | Only admins. |
| `/errorLogs/{id}` | Public write allowed (all runtime errors captured). | Only admins can read/write. | Only admins. |

---

## 2. The "Dirty Dozen" (Attack Payloads & Threat Vectors)

Here are the 12 malicious payloads designed to breach access control systems, alter state transitions, or perform privilege escalation:

### 1. Self-Assigned Role Escalation
* **Vector**: Authenticated user attempts to set their own profile role to `admin` or set `isAdmin = true`.
* **Payload (Update on `/users/attacker-uid`)**:
  ```json
  { "role": "admin", "isAdmin": true, "email": "member@example.com" }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Blocked by owner update restricted field check).

### 2. Identity Impersonation (Spoofing)
* **Vector**: User `attacker-uid` attempts to write a wellness goal pretending to be user `victim-uid`.
* **Payload (Create on `/wellnessGoals/goal-123`)**:
  ```json
  { "userId": "victim-uid", "title": "Retrieve Victim Data", "createdAt": "request.time" }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Strict validation on `request.resource.data.userId == request.auth.uid`).

### 3. PII Scraping via Blanket List
* **Vector**: Authenticated non-admin attempts to retrieve lists of other users’ documents containing emails, phone numbers, etc.
* **Query**: `collection('users').get()`
* **Expected Result**: `PERMISSION_DENIED` (No blanket list capability for non-admins).

### 4. Privilege Hijack via Email Spoofing
* **Vector**: Attacker configures unverified custom email claim as `admin@thevaginaroom.com` and attempts admin-only actions.
* **Payload / Auth**: `request.auth.token.email_verified == false`
* **Expected Result**: `PERMISSION_DENIED` (Mandatory verification checks `email_verified == true`).

### 5. Infinite Wallet Drain / Value Poisoning
* **Vector**: Attacker attempts to inject custom large numbers or invalid data types into a whitelisted discount/pricing configuration.
* **Payload (Create/Update on `/discountCodes/discount-123`)**:
  ```json
  { "code": "HACK99", "discountPercent": 999999, "isActive": true }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Requires admin credentials).

### 6. Relational Sync Shortcutting (Orphaned Logs)
* **Vector**: Creating a direct message without a sender ID or with invalid relation.
* **Payload (Create on `/direct_messages/msg-123`)**:
  ```json
  { "recipientId": "victim-uid", "content": "Hello", "createdAt": "request.time" }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Mandatory `senderId` presence check).

### 7. Order Spoofing & Checkout Hijack
* **Vector**: Attacker attempts to create an order document owned by a victim or manipulate pricing details during checkout creation.
* **Payload (Create on `/orders/order-123`)**:
  ```json
  { "userId": "victim-uid", "items": [{"title": "Course", "price": 0.01}], "status": "approved" }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Owner mismatch on order creation).

### 8. Denial of Wallet via Multi-Megabyte ID Poisoning
* **Vector**: Client attempts to write a document with an extremely long ID containing non-alphanumeric escape sequences.
* **Target Path**: `/wellnessReflections/junk_unicode_chars_longer_than_1500_bytes_...`
* **Expected Result**: `PERMISSION_DENIED` (Checked using `isValidId(id)` helper).

### 9. State Shortcutting on Withdrawal Requests
* **Vector**: Ambassador attempts to mark their own payout withdrawal request as `completed` / `disbursed`.
* **Payload (Update `/payout_history/payout-123`)**:
  ```json
  { "status": "completed" }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Only admins can update/delete payout history status).

### 10. Public Directory Corruption (Brutalist Content Deletion)
* **Vector**: Unauthenticated scraper scripts attempt to delete or edit public botanical pages/blog posts.
* **Target Path**: `/blogs/blog-id` / `/pages/page-id`
* **Expected Result**: `PERMISSION_DENIED` (Write operations restricted entirely to verified admins).

### 11. Overwriting Immortal Fields
* **Vector**: Modifying the immutable `createdAt` timestamp on an existing wellness reflection document to change the user's diary history.
* **Payload (Update `/wellnessReflections/reflection-123`)**:
  ```json
  { "createdAt": "2020-01-01T00:00:00Z" }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Strictly validates `incoming().createdAt == existing().createdAt`).

### 12. Public Resource Harvesting (Scraping Premium Educational Materials)
* **Vector**: Non-member / standard authenticated user attempts to scrape links from `/exclusiveContent/` or `/resource_library/`.
* **Target Path**: `/exclusiveContent/premium-post`
* **Expected Result**: `PERMISSION_DENIED` (Enforced `isMember()` check).

---

## 3. Test Runner Design Reference

The following dynamic test specification represents the logical target of our unit assertions inside `firestore.rules`:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

// Target system validators to confirm Zero Leakage
describe("The Vagina Room Security Rules Test Suite", () => {
  it("should fail self-assigned role escalations", async () => {
    // Assert user rules reject modifications to `role` and `isAdmin`
  });
  it("should block unverified email accesses on admin endpoints", async () => {
    // Audit email_verified verification checks
  });
});
```

---
