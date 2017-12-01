#!/usr/bin/perl -w

# Copyright 2017 Thomas Insel <tinsel@tinsel.org>
#  
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#  
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an "AS
# IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.  See the License for the specific language
# governing permissions and limitations under the License.

my $TO = 5;
my $SL = 1;

use strict;

$SIG{'INT'} = 'cleanup';
sub cleanup {die "\nending\n";}

print "starting at " . `date`;

while (1) {

  my $rc = 0;

  eval {
    local $SIG{ALRM} = sub { die "alarm\n" };
    alarm $TO;
    system join ' ', ('./sync_outlets.pl', @ARGV, 'sync');
    $rc = $?;
    alarm 0;
  };

  if ($@) {
    print "timeout at " . `date`;
  }

  if ($rc) {
    print "quitting because sync_outlets returned $rc at " . `date`;
    exit $rc;
  }

  sleep $SL;

}
