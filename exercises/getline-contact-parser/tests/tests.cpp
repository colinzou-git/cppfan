#include "check.hpp"
#include "contact_parser.hpp"
void test_valid_contact_trims_fields(){ Contact c; CHECK(parseContactLine(" Alice , a@example.com , 555 ", c)); CHECK(c.name=="Alice"); CHECK(c.email=="a@example.com"); CHECK(c.phone=="555"); }
void test_preserves_inner_name_spaces(){ Contact c; CHECK(parseContactLine("Ada Lovelace,ada@x.test,123", c)); CHECK(c.name=="Ada Lovelace"); }
void test_rejects_too_few_fields(){ Contact c; CHECK(!parseContactLine("name,email", c)); }
void test_rejects_empty_email(){ Contact c; CHECK(!parseContactLine("Bob,,555", c)); }
void test_handles_crlf(){ Contact c; CHECK(parseContactLine("Bob,b@x.test,777\r", c)); CHECK(c.phone=="777"); }
int main(){ test_valid_contact_trims_fields(); test_preserves_inner_name_spaces(); test_rejects_too_few_fields(); test_rejects_empty_email(); test_handles_crlf(); return REPORT(); }
