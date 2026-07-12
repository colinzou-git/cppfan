// Tests for getline-contact-parser. Build with -I _harness and the impl dir.
#include <string>

#include "check.hpp"
#include "contact_parser.hpp"

static void test_parses_clean_line() {
  Contact c = parse_contact("Ada Lovelace,ada@math.org,555-0100");
  CHECK(c.valid);
  CHECK(c.name == "Ada Lovelace");
  CHECK(c.email == "ada@math.org");
  CHECK(c.phone == "555-0100");
}

static void test_trims_surrounding_spaces() {
  Contact c = parse_contact("  Grace Hopper ,  grace@navy.mil ,  555-0199 ");
  CHECK(c.valid);
  CHECK(c.name == "Grace Hopper");
  CHECK(c.email == "grace@navy.mil");
  CHECK(c.phone == "555-0199");
}

static void test_rejects_wrong_field_count() {
  CHECK(!parse_contact("OnlyName,only@x.com").valid);
  CHECK(!parse_contact("a,b,c,d").valid);
  CHECK(!parse_contact("no commas here").valid);
}

static void test_rejects_email_without_at() {
  Contact c = parse_contact("Alan Turing,alan-at-bletchley,555-0142");
  CHECK(!c.valid);
}

static void test_rejects_empty_field() {
  CHECK(!parse_contact(",ada@math.org,555-0100").valid);
  CHECK(!parse_contact("Ada,ada@math.org,").valid);
  CHECK(!parse_contact("Ada, ,555-0100").valid);
}

int main() {
  test_parses_clean_line();
  test_trims_surrounding_spaces();
  test_rejects_wrong_field_count();
  test_rejects_email_without_at();
  test_rejects_empty_field();
  return REPORT();
}
