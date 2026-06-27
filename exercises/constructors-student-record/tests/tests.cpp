#include "check.hpp"
#include "student_record.hpp"
void test_normal_record(){ StudentRecord s("Ada",7,3.5); CHECK(s.name()=="Ada"); CHECK(s.id()==7); CHECK(s.gpa()==3.5);}
void test_empty_name_becomes_unknown(){ StudentRecord s("",1,2.0); CHECK(s.name()=="unknown");}
void test_negative_id_becomes_zero(){ StudentRecord s("Bob",-2,2.0); CHECK(s.id()==0);}
void test_gpa_clamped_high(){ StudentRecord s("A",1,9.0); CHECK(s.gpa()==4.0);}
void test_gpa_clamped_low(){ StudentRecord s("A",1,-1.0); CHECK(s.gpa()==0.0);}
void test_const_getters(){ const StudentRecord s("C",3,1.0); CHECK(s.name()=="C"); CHECK(s.id()==3); CHECK(s.gpa()==1.0);}
int main(){ test_normal_record(); test_empty_name_becomes_unknown(); test_negative_id_becomes_zero(); test_gpa_clamped_high(); test_gpa_clamped_low(); test_const_getters(); return REPORT();}
